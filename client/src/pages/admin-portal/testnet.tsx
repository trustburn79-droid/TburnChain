import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  FlaskConical,
  RefreshCw,
  Play,
  Pause,
  Settings,
  Droplets,
  Activity,
  Server,
  Clock,
  CheckCircle,
  AlertTriangle,
  Copy,
  ExternalLink,
  Trash2,
  Plus,
  RotateCcw,
} from "lucide-react";

interface TestnetInstance {
  id: string;
  name: string;
  chainId: number;
  status: "running" | "stopped" | "syncing";
  nodes: number;
  blockHeight: number;
  tps: number;
  uptime: string;
  createdAt: string;
}

interface FaucetRequest {
  id: string;
  address: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  timestamp: string;
}

export default function TestnetManagement() {
  const [activeTab, setActiveTab] = useState("instances");
  const [faucetAddress, setFaucetAddress] = useState("");

  const instances: TestnetInstance[] = [
    {
      id: "1",
      name: "Dev Testnet",
      chainId: 8889,
      status: "running",
      nodes: 4,
      blockHeight: 1284567,
      tps: 1247,
      uptime: "99.9%",
      createdAt: "2024-11-01",
    },
    {
      id: "2",
      name: "Staging Testnet",
      chainId: 8890,
      status: "running",
      nodes: 8,
      blockHeight: 987654,
      tps: 2456,
      uptime: "99.8%",
      createdAt: "2024-10-15",
    },
    {
      id: "3",
      name: "QA Testnet",
      chainId: 8891,
      status: "stopped",
      nodes: 4,
      blockHeight: 456789,
      tps: 0,
      uptime: "95.2%",
      createdAt: "2024-09-01",
    },
  ];

  const faucetRequests: FaucetRequest[] = [
    { id: "1", address: "0x1234...5678", amount: 100, status: "completed", timestamp: "2024-12-04 14:45:00" },
    { id: "2", address: "0xabcd...efgh", amount: 50, status: "pending", timestamp: "2024-12-04 14:42:00" },
    { id: "3", address: "0x9876...5432", amount: 100, status: "completed", timestamp: "2024-12-04 14:38:00" },
    { id: "4", address: "0xdead...beef", amount: 100, status: "failed", timestamp: "2024-12-04 14:35:00" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-500";
      case "stopped":
        return "bg-red-500";
      case "syncing":
        return "bg-yellow-500";
      case "completed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <FlaskConical className="h-8 w-8" />
              Testnet Management
            </h1>
            <p className="text-muted-foreground">테스트넷 관리 | Manage testnet instances and faucet</p>
          </div>
          <div className="flex gap-2">
            <Button data-testid="button-create-testnet">
              <Plus className="h-4 w-4 mr-2" />
              Create Testnet
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Testnets</CardTitle>
              <Server className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">2</div>
              <p className="text-xs text-muted-foreground">of 3 instances</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Nodes</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">16</div>
              <p className="text-xs text-muted-foreground">Across all testnets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faucet Balance</CardTitle>
              <Droplets className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">10M</div>
              <p className="text-xs text-muted-foreground">Test TBURN available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faucet Requests (24h)</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">247</div>
              <p className="text-xs text-muted-foreground">Test tokens distributed</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="instances">Testnet Instances</TabsTrigger>
            <TabsTrigger value="faucet">Faucet</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="instances" className="space-y-4">
            {instances.map((instance) => (
              <Card key={instance.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {instance.name}
                          <Badge className={getStatusColor(instance.status)}>{instance.status}</Badge>
                        </CardTitle>
                        <CardDescription>Chain ID: {instance.chainId}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {instance.status === "running" ? (
                        <Button variant="outline" size="sm">
                          <Pause className="h-4 w-4 mr-1" />
                          Stop
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm">
                          <Play className="h-4 w-4 mr-1" />
                          Start
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Reset
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Nodes</p>
                      <p className="text-lg font-bold">{instance.nodes}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Block Height</p>
                      <p className="text-lg font-bold">{instance.blockHeight.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">TPS</p>
                      <p className="text-lg font-bold">{instance.tps.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Uptime</p>
                      <p className="text-lg font-bold">{instance.uptime}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="text-lg font-bold">{instance.createdAt}</p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex flex-wrap gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">RPC Endpoint</p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          https://rpc-{instance.name.toLowerCase().replace(' ', '-')}.tburn.io
                        </code>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Explorer</p>
                      <Button variant="link" size="sm" className="h-auto p-0">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View Explorer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="faucet" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5" />
                  Request Test Tokens
                </CardTitle>
                <CardDescription>Get test TBURN tokens for development</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Wallet Address</Label>
                    <Input 
                      placeholder="0x..." 
                      value={faucetAddress}
                      onChange={(e) => setFaucetAddress(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input type="number" defaultValue="100" />
                  </div>
                </div>
                <Button className="w-full md:w-auto">
                  <Droplets className="h-4 w-4 mr-2" />
                  Request Tokens
                </Button>
                <p className="text-xs text-muted-foreground">
                  Limit: 100 TBURN per request, 500 TBURN per day per address
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Faucet Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Address</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faucetRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-mono">{request.address}</TableCell>
                        <TableCell>{request.amount} TBURN</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status === "completed" && <CheckCircle className="h-3 w-3 mr-1" />}
                            {request.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                            {request.status === "failed" && <AlertTriangle className="h-3 w-3 mr-1" />}
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{request.timestamp}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Faucet Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Distributed</p>
                    <p className="text-2xl font-bold">1.2M TBURN</p>
                    <p className="text-xs text-muted-foreground">All time</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Today</p>
                    <p className="text-2xl font-bold">24,700 TBURN</p>
                    <p className="text-xs text-green-500">247 requests</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Unique Addresses</p>
                    <p className="text-2xl font-bold">8,456</p>
                    <p className="text-xs text-muted-foreground">All time</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold text-green-500">98.7%</p>
                    <Progress value={98.7} className="h-2 mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Testnet Settings</CardTitle>
                <CardDescription>Configure testnet parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-restart on failure</p>
                    <p className="text-sm text-muted-foreground">Automatically restart stopped testnets</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Daily backups</p>
                    <p className="text-sm text-muted-foreground">Create daily snapshots of testnet state</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Rate limiting</p>
                    <p className="text-sm text-muted-foreground">Limit faucet requests per IP</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Faucet Daily Limit (per address)</Label>
                    <Input type="number" defaultValue="500" />
                  </div>
                  <div className="space-y-2">
                    <Label>Faucet Request Amount</Label>
                    <Input type="number" defaultValue="100" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
