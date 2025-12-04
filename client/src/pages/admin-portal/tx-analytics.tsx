import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ArrowLeftRight, TrendingUp, Clock, Flame, 
  BarChart3, Filter, Download
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts";

export default function AdminTxAnalytics() {
  const txStats = {
    total24h: "2,847,234",
    avgPerSecond: "32.9",
    successRate: "99.87%",
    avgGas: "125 Ember",
  };

  const txVolume = [
    { hour: "00:00", count: 95000 },
    { hour: "04:00", count: 72000 },
    { hour: "08:00", count: 125000 },
    { hour: "12:00", count: 185000 },
    { hour: "16:00", count: 165000 },
    { hour: "20:00", count: 142000 },
  ];

  const txTypes = [
    { type: "Transfer", count: "1,245,678", percentage: 43.8, avgGas: "85 Ember" },
    { type: "Swap", count: "856,234", percentage: 30.1, avgGas: "150 Ember" },
    { type: "Stake", count: "342,123", percentage: 12.0, avgGas: "120 Ember" },
    { type: "Bridge", count: "234,567", percentage: 8.2, avgGas: "200 Ember" },
    { type: "Contract Call", count: "168,632", percentage: 5.9, avgGas: "180 Ember" },
  ];

  const gasHistory = [
    { hour: "00:00", avg: 100, min: 50, max: 180 },
    { hour: "04:00", avg: 85, min: 45, max: 150 },
    { hour: "08:00", avg: 120, min: 60, max: 220 },
    { hour: "12:00", avg: 145, min: 75, max: 280 },
    { hour: "16:00", avg: 135, min: 70, max: 250 },
    { hour: "20:00", avg: 115, min: 55, max: 200 },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Transaction Analytics</h1>
            <p className="text-muted-foreground">Detailed transaction patterns and statistics</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <ArrowLeftRight className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-muted-foreground">24h Transactions</span>
              </div>
              <div className="text-3xl font-bold">{txStats.total24h}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-sm text-muted-foreground">TPS (Avg)</span>
              </div>
              <div className="text-3xl font-bold">{txStats.avgPerSecond}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-muted-foreground">Success Rate</span>
              </div>
              <div className="text-3xl font-bold text-green-500">{txStats.successRate}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="text-sm text-muted-foreground">Avg Gas</span>
              </div>
              <div className="text-3xl font-bold">{txStats.avgGas}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="volume" className="space-y-4">
          <TabsList>
            <TabsTrigger value="volume">Volume</TabsTrigger>
            <TabsTrigger value="types">Types</TabsTrigger>
            <TabsTrigger value="gas">Gas</TabsTrigger>
          </TabsList>

          <TabsContent value="volume">
            <Card>
              <CardHeader>
                <CardTitle>Transaction Volume (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={txVolume}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="types">
            <Card>
              <CardHeader>
                <CardTitle>Transaction Types</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Count (24h)</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Avg Gas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {txTypes.map((type, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{type.type}</TableCell>
                        <TableCell>{type.count}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{type.percentage}%</Badge>
                        </TableCell>
                        <TableCell>{type.avgGas}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gas">
            <Card>
              <CardHeader>
                <CardTitle>Gas Price History (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={gasHistory}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="avg" stroke="#3b82f6" name="Average" strokeWidth={2} />
                      <Line type="monotone" dataKey="min" stroke="#22c55e" name="Min" strokeDasharray="5 5" />
                      <Line type="monotone" dataKey="max" stroke="#ef4444" name="Max" strokeDasharray="5 5" />
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
