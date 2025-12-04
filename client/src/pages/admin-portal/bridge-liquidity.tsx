import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Droplets, TrendingUp, AlertTriangle, ArrowUpRight, 
  ArrowDownRight, RefreshCw, Plus, Minus
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function AdminBridgeLiquidity() {
  const liquidityStats = {
    totalLocked: "$120.5M",
    utilizationRate: "68%",
    dailyVolume: "$12.5M",
    rebalanceNeeded: 2,
  };

  const poolsByChain = [
    { chain: "Ethereum", locked: "$45.2M", available: "$32.5M", utilization: 72, tokens: ["USDT", "USDC", "wTBURN"] },
    { chain: "BSC", locked: "$28.7M", available: "$22.1M", utilization: 65, tokens: ["USDT", "BUSD", "wTBURN"] },
    { chain: "Polygon", locked: "$15.3M", available: "$12.8M", utilization: 58, tokens: ["USDT", "USDC"] },
    { chain: "Avalanche", locked: "$12.1M", available: "$9.2M", utilization: 45, tokens: ["USDT", "AVAX"] },
    { chain: "Arbitrum", locked: "$8.5M", available: "$6.1M", utilization: 40, tokens: ["USDT", "ARB"] },
    { chain: "Optimism", locked: "$6.2M", available: "$2.8M", utilization: 88, tokens: ["USDT", "OP"] },
    { chain: "Base", locked: "$4.1M", available: "$3.5M", utilization: 35, tokens: ["USDT", "USDC"] },
  ];

  const liquidityHistory = [
    { date: "Nov 27", total: 105 },
    { date: "Nov 28", total: 108 },
    { date: "Nov 29", total: 112 },
    { date: "Nov 30", total: 115 },
    { date: "Dec 1", total: 118 },
    { date: "Dec 2", total: 120 },
    { date: "Dec 3", total: 120.5 },
  ];

  const tokenDistribution = [
    { name: "USDT", value: 45, color: "#22c55e" },
    { name: "USDC", value: 30, color: "#3b82f6" },
    { name: "wTBURN", value: 20, color: "#f97316" },
    { name: "Other", value: 5, color: "#a855f7" },
  ];

  const rebalanceAlerts = [
    { from: "Optimism", to: "Ethereum", amount: "$2.5M", reason: "High utilization on Optimism (88%)", priority: "high" },
    { from: "Polygon", to: "BSC", amount: "$1.2M", reason: "Low utilization on Polygon (58%)", priority: "medium" },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Liquidity Management</h1>
            <p className="text-muted-foreground">Manage bridge liquidity pools across chains</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Auto Rebalance
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Liquidity
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-muted-foreground">Total Locked</span>
              </div>
              <div className="text-3xl font-bold">{liquidityStats.totalLocked}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Utilization</span>
              </div>
              <div className="text-3xl font-bold">{liquidityStats.utilizationRate}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpRight className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-muted-foreground">24h Volume</span>
              </div>
              <div className="text-3xl font-bold">{liquidityStats.dailyVolume}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-muted-foreground">Rebalance Needed</span>
              </div>
              <div className="text-3xl font-bold text-yellow-500">{liquidityStats.rebalanceNeeded}</div>
            </CardContent>
          </Card>
        </div>

        {rebalanceAlerts.length > 0 && (
          <Card className="border-yellow-500/30 bg-yellow-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                Rebalance Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rebalanceAlerts.map((alert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant={alert.priority === "high" ? "destructive" : "secondary"}>
                        {alert.priority}
                      </Badge>
                      <div>
                        <p className="font-medium">{alert.from} → {alert.to}: {alert.amount}</p>
                        <p className="text-sm text-muted-foreground">{alert.reason}</p>
                      </div>
                    </div>
                    <Button size="sm">Execute</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="pools" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pools" data-testid="tab-pools">
              <Droplets className="w-4 h-4 mr-2" />
              Liquidity Pools
            </TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">
              <TrendingUp className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger value="distribution" data-testid="tab-distribution">
              <TrendingUp className="w-4 h-4 mr-2" />
              Distribution
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pools">
            <Card>
              <CardHeader>
                <CardTitle>Pools by Chain</CardTitle>
                <CardDescription>Liquidity status across all connected chains</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Chain</TableHead>
                      <TableHead>Total Locked</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Utilization</TableHead>
                      <TableHead>Supported Tokens</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {poolsByChain.map((pool, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{pool.chain}</TableCell>
                        <TableCell>{pool.locked}</TableCell>
                        <TableCell>{pool.available}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={pool.utilization} className="w-20" />
                            <span className={
                              pool.utilization > 80 ? "text-red-500" :
                              pool.utilization > 60 ? "text-yellow-500" : "text-green-500"
                            }>
                              {pool.utilization}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {pool.tokens.map((token, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{token}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost">
                              <Plus className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Minus className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Total Liquidity (7 Days)</CardTitle>
                <CardDescription>TVL in millions USD</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={liquidityHistory}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[100, 125]} />
                      <Tooltip />
                      <Area type="monotone" dataKey="total" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distribution">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Token Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={tokenDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {tokenDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-4 mt-4">
                    {tokenDistribution.map((item, index) => (
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
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <Label className="mb-2 block">Add Liquidity</Label>
                    <div className="flex gap-2">
                      <Input placeholder="Amount" type="number" />
                      <Button>Add</Button>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <Label className="mb-2 block">Remove Liquidity</Label>
                    <div className="flex gap-2">
                      <Input placeholder="Amount" type="number" />
                      <Button variant="destructive">Remove</Button>
                    </div>
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
