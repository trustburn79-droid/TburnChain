import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Flame, Clock, TrendingUp, Brain, Calendar, Target, 
  History, Settings, AlertTriangle, Zap, BarChart3
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

export default function AdminBurnControl() {
  const [txBurnRate, setTxBurnRate] = useState([1.0]);
  const [timeBurnRate, setTimeBurnRate] = useState([0.1]);

  const burnStats = {
    totalBurned: "100,000,000",
    burnPercentage: "10.0",
    dailyBurn: "150,000",
    weeklyBurn: "1,050,000",
    targetSupply: "500,000,000",
    currentSupply: "900,000,000",
    burnVelocity: "6,250",
  };

  const burnHistory = [
    { date: "Dec 3", txBurn: 45000, timeBurn: 30000, aiBurn: 75000 },
    { date: "Dec 2", txBurn: 42000, timeBurn: 30000, aiBurn: 68000 },
    { date: "Dec 1", txBurn: 48000, timeBurn: 30000, aiBurn: 82000 },
    { date: "Nov 30", txBurn: 40000, timeBurn: 30000, aiBurn: 65000 },
    { date: "Nov 29", txBurn: 44000, timeBurn: 30000, aiBurn: 70000 },
    { date: "Nov 28", txBurn: 46000, timeBurn: 30000, aiBurn: 72000 },
    { date: "Nov 27", txBurn: 41000, timeBurn: 30000, aiBurn: 66000 },
  ];

  const scheduledBurns = [
    { id: 1, type: "Time-based", amount: "500,000 TBURN", schedule: "Daily at 00:00 UTC", status: "active", nextRun: "2024-12-04 00:00" },
    { id: 2, type: "Volume-based", amount: "0.5% of volume", schedule: "When 24h volume > 10M", status: "active", nextRun: "Condition-based" },
    { id: 3, type: "AI Optimized", amount: "AI calculated", schedule: "Every 6 hours", status: "active", nextRun: "2024-12-03 18:00" },
  ];

  const burnEvents = [
    { id: 1, type: "Transaction", amount: "12,500", txHash: "0xabc...123", timestamp: "2024-12-03 14:30:25" },
    { id: 2, type: "AI Optimized", amount: "75,000", txHash: "0xdef...456", timestamp: "2024-12-03 12:00:00" },
    { id: 3, type: "Time-based", amount: "30,000", txHash: "0xghi...789", timestamp: "2024-12-03 00:00:00" },
    { id: 4, type: "Manual", amount: "100,000", txHash: "0xjkl...012", timestamp: "2024-12-02 15:45:30" },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Burn Control</h1>
            <p className="text-muted-foreground">Manage token burn rates, schedules, and AI optimization</p>
          </div>
          <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/30">
            <Flame className="w-3 h-3 mr-1" />
            Deflationary Active
          </Badge>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-orange-500 mb-2">
                <Flame className="w-5 h-5" />
                <span className="text-sm">Total Burned</span>
              </div>
              <div className="text-3xl font-bold">{burnStats.totalBurned}</div>
              <div className="text-sm text-muted-foreground">TBURN</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm">Burn Rate</span>
              </div>
              <div className="text-3xl font-bold">{burnStats.burnPercentage}%</div>
              <div className="text-sm text-muted-foreground">of total supply</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm">24h Burn</span>
              </div>
              <div className="text-3xl font-bold">{burnStats.dailyBurn}</div>
              <div className="text-sm text-muted-foreground">TBURN</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Zap className="w-5 h-5" />
                <span className="text-sm">Burn Velocity</span>
              </div>
              <div className="text-3xl font-bold">{burnStats.burnVelocity}</div>
              <div className="text-sm text-muted-foreground">TBURN/hour</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Supply Target Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>Current Supply: {burnStats.currentSupply} TBURN</span>
                <span>Target: {burnStats.targetSupply} TBURN</span>
              </div>
              <Progress value={55.6} className="h-3" />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>44.4% remaining to target</span>
                <span>Est. completion: ~640 days at current rate</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="rates" className="space-y-4">
          <TabsList>
            <TabsTrigger value="rates" data-testid="tab-rates">
              <Settings className="w-4 h-4 mr-2" />
              Burn Rates
            </TabsTrigger>
            <TabsTrigger value="ai" data-testid="tab-ai">
              <Brain className="w-4 h-4 mr-2" />
              AI Optimization
            </TabsTrigger>
            <TabsTrigger value="schedule" data-testid="tab-schedule">
              <Calendar className="w-4 h-4 mr-2" />
              Schedules
            </TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">
              <History className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rates" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Burn Rate</CardTitle>
                  <CardDescription>Percentage burned from each transaction</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Current Rate</Label>
                      <span className="text-2xl font-bold">{txBurnRate[0]}%</span>
                    </div>
                    <Slider
                      value={txBurnRate}
                      onValueChange={setTxBurnRate}
                      min={0.01}
                      max={5}
                      step={0.01}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0.01%</span>
                      <span>5%</span>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground">Estimated 24h burn at current rate</div>
                    <div className="text-lg font-semibold">~45,000 TBURN</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Time-based Burn Rate</CardTitle>
                  <CardDescription>Daily automatic burn percentage</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Daily Rate</Label>
                      <span className="text-2xl font-bold">{timeBurnRate[0]}%</span>
                    </div>
                    <Slider
                      value={timeBurnRate}
                      onValueChange={setTimeBurnRate}
                      min={0.01}
                      max={1}
                      step={0.01}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0.01%</span>
                      <span>1%</span>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground">Next scheduled burn</div>
                    <div className="text-lg font-semibold">30,000 TBURN at 00:00 UTC</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Volume-based Burn</CardTitle>
                <CardDescription>Additional burn triggered by high trading volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Volume Threshold</Label>
                    <Input type="number" defaultValue="10000000" />
                    <span className="text-xs text-muted-foreground">TBURN (24h volume)</span>
                  </div>
                  <div className="space-y-2">
                    <Label>Burn Rate on Trigger</Label>
                    <Input type="number" defaultValue="0.5" step="0.1" />
                    <span className="text-xs text-muted-foreground">% of volume</span>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <div className="flex items-center gap-2 h-10">
                      <Switch defaultChecked />
                      <span className="text-sm">Enabled</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                  AI Burn Optimization
                </CardTitle>
                <CardDescription>GPT-5 Turbo powered burn rate optimization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">AI Optimization</p>
                        <p className="text-sm text-muted-foreground">Allow AI to adjust burn rates</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="space-y-2">
                      <Label>Minimum Confidence</Label>
                      <Input type="number" defaultValue="70" />
                      <span className="text-xs text-muted-foreground">AI decisions below this confidence require manual approval</span>
                    </div>
                    <div className="space-y-2">
                      <Label>Update Frequency</Label>
                      <Input type="number" defaultValue="6" />
                      <span className="text-xs text-muted-foreground">Hours between AI optimization checks</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                      <div className="text-sm text-purple-500 font-medium mb-2">Current AI Recommendation</div>
                      <div className="text-2xl font-bold">1.15%</div>
                      <div className="text-sm text-muted-foreground">Transaction burn rate</div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="bg-green-500/10 text-green-500">
                          85% Confidence
                        </Badge>
                        <span className="text-xs text-muted-foreground">Based on market analysis</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>AI Impact Weight</Label>
                      <Slider defaultValue={[50]} min={0} max={100} />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Manual Only</span>
                        <span>Full AI Control</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Optimization Goals</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Target Supply:</span>
                      <p className="font-medium">500M TBURN</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Target Timeline:</span>
                      <p className="font-medium">2 years</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Priority:</span>
                      <p className="font-medium">Price Stability</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Scheduled Burns
                </CardTitle>
                <CardDescription>Automated burn schedules</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Next Run</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scheduledBurns.map((burn) => (
                      <TableRow key={burn.id}>
                        <TableCell className="font-medium">{burn.type}</TableCell>
                        <TableCell>{burn.amount}</TableCell>
                        <TableCell>{burn.schedule}</TableCell>
                        <TableCell>
                          <Badge variant={burn.status === "active" ? "default" : "secondary"}>
                            {burn.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{burn.nextRun}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost">Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4">
                  <Button variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Add Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Burn Analytics (7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={burnHistory}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Area type="monotone" dataKey="txBurn" stackId="1" stroke="#f97316" fill="#f97316" fillOpacity={0.3} name="TX Burn" />
                      <Area type="monotone" dataKey="timeBurn" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Time Burn" />
                      <Area type="monotone" dataKey="aiBurn" stackId="1" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} name="AI Burn" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Burn Events</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>TX Hash</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {burnEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <Badge variant="outline">{event.type}</Badge>
                        </TableCell>
                        <TableCell className="font-mono">{event.amount} TBURN</TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">{event.txHash}</TableCell>
                        <TableCell className="text-muted-foreground">{event.timestamp}</TableCell>
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
