import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Link2, ArrowLeftRight, Activity, Shield, Clock, 
  CheckCircle, AlertTriangle, TrendingUp, Wallet
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminBridgeDashboard() {
  const bridgeStats = {
    totalVolume24h: "$12.5M",
    activeTransfers: 156,
    completedToday: 2847,
    avgTransferTime: "3.2 min",
  };

  const chains = [
    { name: "Ethereum", symbol: "ETH", status: "active", tvl: "$45.2M", volume24h: "$5.2M", pending: 42, validators: 8 },
    { name: "BSC", symbol: "BNB", status: "active", tvl: "$28.7M", volume24h: "$3.1M", pending: 28, validators: 8 },
    { name: "Polygon", symbol: "MATIC", status: "active", tvl: "$15.3M", volume24h: "$1.8M", pending: 15, validators: 8 },
    { name: "Avalanche", symbol: "AVAX", status: "active", tvl: "$12.1M", volume24h: "$1.2M", pending: 12, validators: 8 },
    { name: "Arbitrum", symbol: "ARB", status: "active", tvl: "$8.5M", volume24h: "$0.8M", pending: 8, validators: 8 },
    { name: "Optimism", symbol: "OP", status: "degraded", tvl: "$6.2M", volume24h: "$0.3M", pending: 35, validators: 6 },
    { name: "Base", symbol: "BASE", status: "active", tvl: "$4.1M", volume24h: "$0.1M", pending: 3, validators: 8 },
  ];

  const volumeData = [
    { time: "00:00", eth: 1200, bsc: 800, polygon: 400 },
    { time: "04:00", eth: 900, bsc: 700, polygon: 350 },
    { time: "08:00", eth: 1500, bsc: 1000, polygon: 500 },
    { time: "12:00", eth: 2000, bsc: 1200, polygon: 600 },
    { time: "16:00", eth: 1800, bsc: 1100, polygon: 550 },
    { time: "20:00", eth: 1400, bsc: 900, polygon: 450 },
  ];

  const recentTransfers = [
    { id: "0xabc...123", from: "Ethereum", to: "TBURN", amount: "50,000 USDT", status: "completed", time: "2 min ago" },
    { id: "0xdef...456", from: "TBURN", to: "BSC", amount: "100,000 TBURN", status: "pending", time: "5 min ago" },
    { id: "0xghi...789", from: "Polygon", to: "TBURN", amount: "25,000 USDC", status: "validating", time: "8 min ago" },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Bridge Dashboard</h1>
            <p className="text-muted-foreground">Cross-chain bridge monitoring and management</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Shield className="w-4 h-4 mr-2" />
              Security Status
            </Button>
            <Button>
              <Activity className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-muted-foreground">24h Volume</span>
              </div>
              <div className="text-3xl font-bold">{bridgeStats.totalVolume24h}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <ArrowLeftRight className="w-5 h-5 text-orange-500" />
                <span className="text-sm text-muted-foreground">Active Transfers</span>
              </div>
              <div className="text-3xl font-bold">{bridgeStats.activeTransfers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Completed Today</span>
              </div>
              <div className="text-3xl font-bold">{bridgeStats.completedToday}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-muted-foreground">Avg Transfer Time</span>
              </div>
              <div className="text-3xl font-bold">{bridgeStats.avgTransferTime}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="chains" className="space-y-4">
          <TabsList>
            <TabsTrigger value="chains" data-testid="tab-chains">
              <Link2 className="w-4 h-4 mr-2" />
              Connected Chains
            </TabsTrigger>
            <TabsTrigger value="volume" data-testid="tab-volume">
              <TrendingUp className="w-4 h-4 mr-2" />
              Volume
            </TabsTrigger>
            <TabsTrigger value="transfers" data-testid="tab-transfers">
              <ArrowLeftRight className="w-4 h-4 mr-2" />
              Recent Transfers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chains">
            <Card>
              <CardHeader>
                <CardTitle>Connected Chains (7)</CardTitle>
                <CardDescription>Status of all connected blockchain networks</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Chain</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>TVL</TableHead>
                      <TableHead>24h Volume</TableHead>
                      <TableHead>Pending TX</TableHead>
                      <TableHead>Validators</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chains.map((chain, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <span className="text-xs font-bold">{chain.symbol}</span>
                            </div>
                            <span className="font-medium">{chain.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={chain.status === "active" ? "default" : "destructive"} className={chain.status === "active" ? "bg-green-500" : ""}>
                            {chain.status === "active" ? (
                              <><CheckCircle className="w-3 h-3 mr-1" /> Active</>
                            ) : (
                              <><AlertTriangle className="w-3 h-3 mr-1" /> Degraded</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>{chain.tvl}</TableCell>
                        <TableCell>{chain.volume24h}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{chain.pending}</Badge>
                        </TableCell>
                        <TableCell>{chain.validators}/8</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="volume">
            <Card>
              <CardHeader>
                <CardTitle>Volume by Chain (24h)</CardTitle>
                <CardDescription>Transfer volume in thousands USD</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={volumeData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="eth" stroke="#3b82f6" name="Ethereum" strokeWidth={2} />
                      <Line type="monotone" dataKey="bsc" stroke="#f59e0b" name="BSC" strokeWidth={2} />
                      <Line type="monotone" dataKey="polygon" stroke="#8b5cf6" name="Polygon" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transfers">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transfers</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>TX ID</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTransfers.map((tx, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono">{tx.id}</TableCell>
                        <TableCell>{tx.from}</TableCell>
                        <TableCell>{tx.to}</TableCell>
                        <TableCell>{tx.amount}</TableCell>
                        <TableCell>
                          <Badge variant={
                            tx.status === "completed" ? "default" :
                            tx.status === "pending" ? "secondary" : "outline"
                          } className={tx.status === "completed" ? "bg-green-500" : ""}>
                            {tx.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{tx.time}</TableCell>
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
