import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Brain, Cpu, Zap, Activity, Clock, CheckCircle, 
  AlertTriangle, Settings, History, BarChart3, RefreshCw
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminAIOrchestration() {
  const aiModels = [
    { 
      id: 1, 
      name: "GPT-5 Turbo", 
      layer: "Strategic", 
      status: "online", 
      latency: 450, 
      tokenRate: 150,
      accuracy: 98.7,
      requests24h: 12500,
      cost24h: 125.50
    },
    { 
      id: 2, 
      name: "Claude Sonnet 4.5", 
      layer: "Tactical", 
      status: "online", 
      latency: 180, 
      tokenRate: 2100,
      accuracy: 97.2,
      requests24h: 45000,
      cost24h: 89.25
    },
    { 
      id: 3, 
      name: "Llama 3.3 70B", 
      layer: "Operational", 
      status: "online", 
      latency: 45, 
      tokenRate: 890,
      accuracy: 95.8,
      requests24h: 180000,
      cost24h: 0
    },
  ];

  const decisions = [
    { id: 1, type: "Strategic", content: "Increase validator committee to 120", confidence: 92, executed: true, timestamp: "2024-12-03 14:30" },
    { id: 2, type: "Tactical", content: "Rebalance shard 5 load to shard 8", confidence: 88, executed: true, timestamp: "2024-12-03 14:25" },
    { id: 3, type: "Operational", content: "Adjust gas price to 115 Ember", confidence: 95, executed: true, timestamp: "2024-12-03 14:20" },
    { id: 4, type: "Strategic", content: "Activate bridge circuit breaker", confidence: 65, executed: false, timestamp: "2024-12-03 14:15" },
  ];

  const performanceData = [
    { time: "00:00", gpt5: 450, claude: 180, llama: 45 },
    { time: "04:00", gpt5: 460, claude: 175, llama: 48 },
    { time: "08:00", gpt5: 480, claude: 190, llama: 52 },
    { time: "12:00", gpt5: 445, claude: 185, llama: 44 },
    { time: "16:00", gpt5: 455, claude: 178, llama: 46 },
    { time: "20:00", gpt5: 448, claude: 182, llama: 47 },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">AI Orchestration</h1>
            <p className="text-muted-foreground">Triple-Band AI system monitoring and control</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync All
            </Button>
            <Button>
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {aiModels.map((model) => (
            <Card key={model.id} className={
              model.layer === "Strategic" ? "border-blue-500/30 bg-blue-500/5" :
              model.layer === "Tactical" ? "border-purple-500/30 bg-purple-500/5" :
              "border-green-500/30 bg-green-500/5"
            }>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className={
                      model.layer === "Strategic" ? "text-blue-500" :
                      model.layer === "Tactical" ? "text-purple-500" :
                      "text-green-500"
                    } />
                    {model.name}
                  </CardTitle>
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {model.status}
                  </Badge>
                </div>
                <CardDescription>{model.layer} Layer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Latency</span>
                    <p className="font-medium">{model.latency}ms</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Token Rate</span>
                    <p className="font-medium">{model.tokenRate}/sec</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Accuracy</span>
                    <p className="font-medium">{model.accuracy}%</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">24h Requests</span>
                    <p className="font-medium">{model.requests24h.toLocaleString()}</p>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">24h Cost</span>
                    <span className="font-medium">${model.cost24h.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Decision Hierarchy</CardTitle>
            <CardDescription>How AI layers interact and override each other</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-500/20">
                  <Brain className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">Strategic (GPT-5)</p>
                  <p className="text-sm text-muted-foreground">Every 6 hours • 50% weight</p>
                </div>
              </div>
              <div className="text-2xl">→</div>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-purple-500/20">
                  <Brain className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium">Tactical (Claude)</p>
                  <p className="text-sm text-muted-foreground">Every block • 30% weight</p>
                </div>
              </div>
              <div className="text-2xl">→</div>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-500/20">
                  <Brain className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">Operational (Llama)</p>
                  <p className="text-sm text-muted-foreground">Immediate • 20% weight</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="decisions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="decisions" data-testid="tab-decisions">
              <Zap className="w-4 h-4 mr-2" />
              Decisions
            </TabsTrigger>
            <TabsTrigger value="performance" data-testid="tab-performance">
              <Activity className="w-4 h-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="config" data-testid="tab-config">
              <Settings className="w-4 h-4 mr-2" />
              Configuration
            </TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">
              <History className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="decisions">
            <Card>
              <CardHeader>
                <CardTitle>Recent AI Decisions</CardTitle>
                <CardDescription>Latest decisions made by the AI orchestration system</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Decision</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {decisions.map((decision) => (
                      <TableRow key={decision.id}>
                        <TableCell>
                          <Badge variant="outline" className={
                            decision.type === "Strategic" ? "bg-blue-500/10 text-blue-500" :
                            decision.type === "Tactical" ? "bg-purple-500/10 text-purple-500" :
                            "bg-green-500/10 text-green-500"
                          }>
                            {decision.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{decision.content}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={decision.confidence} className="w-16" />
                            <span className={decision.confidence >= 70 ? "text-green-500" : "text-yellow-500"}>
                              {decision.confidence}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {decision.executed ? (
                            <Badge className="bg-green-500">Executed</Badge>
                          ) : (
                            <Badge variant="outline" className="text-yellow-500">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Pending Review
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{decision.timestamp}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Latency Comparison (24h)</CardTitle>
                <CardDescription>Response time comparison across AI models</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="gpt5" stroke="#3b82f6" name="GPT-5" strokeWidth={2} />
                      <Line type="monotone" dataKey="claude" stroke="#a855f7" name="Claude" strokeWidth={2} />
                      <Line type="monotone" dataKey="llama" stroke="#22c55e" name="Llama" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-4 gap-4 mt-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold">98.2%</div>
                  <div className="text-sm text-muted-foreground">Overall Accuracy</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold">237.5k</div>
                  <div className="text-sm text-muted-foreground">Total Requests (24h)</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold">$214.75</div>
                  <div className="text-sm text-muted-foreground">Total Cost (24h)</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold">99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="config">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Model Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {aiModels.map((model) => (
                    <div key={model.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{model.name}</p>
                        <p className="text-sm text-muted-foreground">{model.layer} Layer</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Confidence Thresholds</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Auto-Execute Threshold</p>
                      <p className="text-sm text-muted-foreground">Minimum confidence for auto-execution</p>
                    </div>
                    <Badge>70%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Human Review Threshold</p>
                      <p className="text-sm text-muted-foreground">Decisions below this require review</p>
                    </div>
                    <Badge>50%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Rejection Threshold</p>
                      <p className="text-sm text-muted-foreground">Automatically reject below this</p>
                    </div>
                    <Badge>30%</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Decision History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>View full decision history with filters and export options</p>
                  <Button variant="outline" className="mt-4">Load History</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
