import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  TrendingUp, TrendingDown, Coins, Gift, Percent, PiggyBank, 
  Brain, BarChart3, Target, AlertTriangle, Calculator
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function AdminEconomics() {
  const economicMetrics = {
    inflationRate: "3.5",
    deflationRate: "4.2",
    netChange: "-0.7",
    stakingRatio: "45.6",
    velocity: "2.8",
    giniCoefficient: "0.42",
  };

  const rewardDistribution = [
    { name: "Validators", value: 40, color: "#3b82f6" },
    { name: "Delegators", value: 35, color: "#22c55e" },
    { name: "Development", value: 15, color: "#f97316" },
    { name: "Community", value: 10, color: "#a855f7" },
  ];

  const inflationSchedule = [
    { year: "Year 1", rate: "5.0%", blockReward: "50 TBURN" },
    { year: "Year 2", rate: "4.0%", blockReward: "40 TBURN" },
    { year: "Year 3", rate: "3.0%", blockReward: "30 TBURN" },
    { year: "Year 4", rate: "2.0%", blockReward: "20 TBURN" },
    { year: "Year 5+", rate: "1.0%", blockReward: "10 TBURN" },
  ];

  const supplyProjection = [
    { month: "Jan", supply: 900, target: 850 },
    { month: "Feb", supply: 895, target: 840 },
    { month: "Mar", supply: 888, target: 830 },
    { month: "Apr", supply: 880, target: 820 },
    { month: "May", supply: 872, target: 810 },
    { month: "Jun", supply: 864, target: 800 },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Economic Parameters</h1>
            <p className="text-muted-foreground">Manage inflation, rewards, and tokenomics</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calculator className="w-4 h-4 mr-2" />
              Simulate
            </Button>
            <Button>Save Changes</Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-red-500" />
                <span className="text-sm text-muted-foreground">Inflation Rate</span>
              </div>
              <div className="text-3xl font-bold">{economicMetrics.inflationRate}%</div>
              <div className="text-sm text-muted-foreground">Annual token creation</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Deflation Rate</span>
              </div>
              <div className="text-3xl font-bold">{economicMetrics.deflationRate}%</div>
              <div className="text-sm text-muted-foreground">Annual token burn</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-5 h-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Net Change</span>
              </div>
              <div className="text-3xl font-bold text-green-500">{economicMetrics.netChange}%</div>
              <div className="text-sm text-muted-foreground">Deflationary</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <PiggyBank className="w-5 h-5" />
                <span className="text-sm text-muted-foreground">Staking Ratio</span>
              </div>
              <div className="text-2xl font-bold">{economicMetrics.stakingRatio}%</div>
              <Progress value={parseFloat(economicMetrics.stakingRatio)} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5" />
                <span className="text-sm text-muted-foreground">Token Velocity</span>
              </div>
              <div className="text-2xl font-bold">{economicMetrics.velocity}x</div>
              <div className="text-sm text-muted-foreground">Times circulated per year</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5" />
                <span className="text-sm text-muted-foreground">Gini Coefficient</span>
              </div>
              <div className="text-2xl font-bold">{economicMetrics.giniCoefficient}</div>
              <div className="text-sm text-muted-foreground">Distribution equality</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="inflation" className="space-y-4">
          <TabsList>
            <TabsTrigger value="inflation" data-testid="tab-inflation">
              <TrendingUp className="w-4 h-4 mr-2" />
              Inflation
            </TabsTrigger>
            <TabsTrigger value="rewards" data-testid="tab-rewards">
              <Gift className="w-4 h-4 mr-2" />
              Rewards
            </TabsTrigger>
            <TabsTrigger value="staking" data-testid="tab-staking">
              <PiggyBank className="w-4 h-4 mr-2" />
              Staking
            </TabsTrigger>
            <TabsTrigger value="simulation" data-testid="tab-simulation">
              <Brain className="w-4 h-4 mr-2" />
              Simulation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inflation" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Inflation Schedule</CardTitle>
                  <CardDescription>Planned inflation rate over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Period</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Block Reward</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inflationSchedule.map((period, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{period.year}</TableCell>
                          <TableCell>{period.rate}</TableCell>
                          <TableCell>{period.blockReward}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Inflation Parameters</CardTitle>
                  <CardDescription>Adjust inflation settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Current Annual Rate</Label>
                      <span className="font-medium">3.5%</span>
                    </div>
                    <Slider defaultValue={[3.5]} min={0} max={10} step={0.1} />
                  </div>
                  <div className="space-y-2">
                    <Label>Block Reward</Label>
                    <Input type="number" defaultValue="30" />
                    <span className="text-xs text-muted-foreground">TBURN per block</span>
                  </div>
                  <div className="space-y-2">
                    <Label>Halving Period</Label>
                    <Input type="number" defaultValue="4" />
                    <span className="text-xs text-muted-foreground">Years between halvings</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Reward Distribution</CardTitle>
                  <CardDescription>How rewards are allocated</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={rewardDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {rewardDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {rewardDistribution.map((item, index) => (
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
                  <CardTitle>Reward Configuration</CardTitle>
                  <CardDescription>Adjust reward allocation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {rewardDistribution.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <Label>{item.name}</Label>
                        <span className="font-medium">{item.value}%</span>
                      </div>
                      <Slider defaultValue={[item.value]} min={0} max={100} />
                    </div>
                  ))}
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mt-4">
                    <div className="flex items-center gap-2 text-yellow-500 text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Total must equal 100%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Validator Commission</CardTitle>
                <CardDescription>Fee settings for validators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Default Commission</Label>
                    <Input type="number" defaultValue="10" />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum Commission</Label>
                    <Input type="number" defaultValue="5" />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                  <div className="space-y-2">
                    <Label>Maximum Commission</Label>
                    <Input type="number" defaultValue="25" />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                  <div className="space-y-2">
                    <Label>Max Daily Change</Label>
                    <Input type="number" defaultValue="1" />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staking" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Staking Incentives</CardTitle>
                <CardDescription>Configure staking rewards and bonuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Target APY</Label>
                        <span className="font-medium">12%</span>
                      </div>
                      <Slider defaultValue={[12]} min={5} max={25} />
                    </div>
                    <div className="space-y-2">
                      <Label>Minimum Stake</Label>
                      <Input type="number" defaultValue="100" />
                      <span className="text-xs text-muted-foreground">TBURN</span>
                    </div>
                    <div className="space-y-2">
                      <Label>Unbonding Period</Label>
                      <Input type="number" defaultValue="14" />
                      <span className="text-xs text-muted-foreground">Days</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">Lock-up Bonuses</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span>30 days lock</span>
                        <Badge variant="outline">+0.5% APY</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span>90 days lock</span>
                        <Badge variant="outline">+1.5% APY</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span>180 days lock</span>
                        <Badge variant="outline">+3.0% APY</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span>365 days lock</span>
                        <Badge variant="outline">+5.0% APY</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="simulation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                  AI Economic Simulation
                </CardTitle>
                <CardDescription>Model supply projections with current parameters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={supplyProjection}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[750, 950]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="supply" stroke="#3b82f6" name="Projected Supply (M)" strokeWidth={2} />
                      <Line type="monotone" dataKey="target" stroke="#22c55e" name="Target Supply (M)" strokeWidth={2} strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <div className="text-sm text-muted-foreground">Projected Supply (6mo)</div>
                    <div className="text-xl font-bold">864M TBURN</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Target Achievement</div>
                    <div className="text-xl font-bold text-green-500">On Track</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">AI Confidence</div>
                    <div className="text-xl font-bold">92%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
