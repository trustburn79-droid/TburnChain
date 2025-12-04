import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Globe,
  Key,
  Shield,
  Clock,
  RefreshCw,
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Settings,
  Activity,
  Save,
  RotateCcw,
  Lock,
  Unlock,
  Link,
  Zap,
} from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string;
  status: "active" | "inactive" | "expired";
  permissions: string[];
  rateLimit: number;
  usageCount: number;
}

interface RateLimitConfig {
  endpoint: string;
  limit: number;
  window: string;
  currentUsage: number;
}

export default function ApiConfig() {
  const [activeTab, setActiveTab] = useState("keys");
  const [showKey, setShowKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const apiKeys: ApiKey[] = [
    {
      id: "1",
      name: "Production API Key",
      key: "sk-live-xxxxxxxxxxxxxxxxxxxx",
      createdAt: "2024-01-15",
      lastUsed: "2024-12-04 14:23:45",
      status: "active",
      permissions: ["read", "write", "admin"],
      rateLimit: 10000,
      usageCount: 847293,
    },
    {
      id: "2",
      name: "Development API Key",
      key: "sk-dev-yyyyyyyyyyyyyyyyyyyy",
      createdAt: "2024-02-20",
      lastUsed: "2024-12-04 13:15:22",
      status: "active",
      permissions: ["read", "write"],
      rateLimit: 1000,
      usageCount: 12847,
    },
    {
      id: "3",
      name: "Analytics API Key",
      key: "sk-analytics-zzzzzzzzzzzzzz",
      createdAt: "2024-03-10",
      lastUsed: "2024-12-03 22:45:00",
      status: "inactive",
      permissions: ["read"],
      rateLimit: 5000,
      usageCount: 234567,
    },
  ];

  const rateLimits: RateLimitConfig[] = [
    { endpoint: "/api/blocks", limit: 100, window: "1m", currentUsage: 45 },
    { endpoint: "/api/transactions", limit: 200, window: "1m", currentUsage: 123 },
    { endpoint: "/api/wallets", limit: 50, window: "1m", currentUsage: 12 },
    { endpoint: "/api/validators", limit: 30, window: "1m", currentUsage: 8 },
    { endpoint: "/api/admin/*", limit: 20, window: "1m", currentUsage: 5 },
  ];

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Globe className="h-8 w-8" />
              API Configuration
            </h1>
            <p className="text-muted-foreground">API 설정 관리 | Manage API keys, rate limits, and endpoints</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.reload()} data-testid="button-refresh">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleSave} disabled={saving} data-testid="button-save">
              {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active API Keys</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">2 active, 1 inactive</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total API Calls (24h)</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,094,707</div>
              <p className="text-xs text-green-500">+12.3% from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rate Limit Status</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">Healthy</div>
              <p className="text-xs text-muted-foreground">All endpoints within limits</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45ms</div>
              <p className="text-xs text-muted-foreground">P99: 124ms</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="keys">API Keys</TabsTrigger>
            <TabsTrigger value="rate-limits">Rate Limits</TabsTrigger>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="keys" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>Manage your API keys and their permissions</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button data-testid="button-create-key">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Key
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New API Key</DialogTitle>
                      <DialogDescription>Create a new API key with specific permissions</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Key Name</Label>
                        <Input placeholder="e.g., Production API Key" />
                      </div>
                      <div className="space-y-2">
                        <Label>Permissions</Label>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span>Read</span>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Write</span>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Admin</span>
                            <Switch />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Rate Limit (requests/minute)</Label>
                        <Input type="number" defaultValue="1000" />
                      </div>
                      <Button className="w-full">Create Key</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Key</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Rate Limit</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell className="font-medium">{key.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {showKey === key.id ? key.key : "sk-****-**********"}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setShowKey(showKey === key.id ? null : key.id)}
                            >
                              {showKey === key.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={key.status === "active" ? "default" : "secondary"}>
                            {key.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {key.permissions.map((perm) => (
                              <Badge key={perm} variant="outline" className="text-xs">
                                {perm}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{key.rateLimit.toLocaleString()}/min</TableCell>
                        <TableCell>{key.usageCount.toLocaleString()}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{key.lastUsed}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon">
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-500">
                              <Trash2 className="h-4 w-4" />
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

          <TabsContent value="rate-limits" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Rate Limit Configuration</CardTitle>
                <CardDescription>Configure rate limits for each API endpoint</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>Limit</TableHead>
                      <TableHead>Window</TableHead>
                      <TableHead>Current Usage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rateLimits.map((limit) => (
                      <TableRow key={limit.endpoint}>
                        <TableCell className="font-mono">{limit.endpoint}</TableCell>
                        <TableCell>{limit.limit} requests</TableCell>
                        <TableCell>{limit.window}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={(limit.currentUsage / limit.limit) * 100} className="w-20" />
                            <span className="text-sm">{limit.currentUsage}/{limit.limit}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={limit.currentUsage < limit.limit * 0.8 ? "default" : "destructive"}>
                            {limit.currentUsage < limit.limit * 0.8 ? "OK" : "Warning"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Global Rate Limit Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Default Rate Limit</Label>
                    <Input type="number" defaultValue="100" />
                    <p className="text-xs text-muted-foreground">Requests per minute per IP</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Burst Limit</Label>
                    <Input type="number" defaultValue="50" />
                    <p className="text-xs text-muted-foreground">Maximum burst requests allowed</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable Rate Limiting</p>
                    <p className="text-sm text-muted-foreground">Apply rate limits to all API endpoints</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="endpoints" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Endpoints Configuration</CardTitle>
                <CardDescription>Configure API endpoint settings and access</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>REST API Base URL</Label>
                    <Input defaultValue="https://api.tburn.io/v1" />
                  </div>
                  <div className="space-y-2">
                    <Label>WebSocket URL</Label>
                    <Input defaultValue="wss://ws.tburn.io" />
                  </div>
                  <div className="space-y-2">
                    <Label>GraphQL Endpoint</Label>
                    <Input defaultValue="https://api.tburn.io/graphql" />
                  </div>
                  <div className="space-y-2">
                    <Label>RPC Endpoint</Label>
                    <Input defaultValue="https://rpc.tburn.io" />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Endpoint Access Control</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Unlock className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium">/api/public/*</p>
                          <p className="text-sm text-muted-foreground">Public endpoints - no authentication required</p>
                        </div>
                      </div>
                      <Badge>Public</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Key className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="font-medium">/api/v1/*</p>
                          <p className="text-sm text-muted-foreground">Authenticated endpoints - API key required</p>
                        </div>
                      </div>
                      <Badge variant="secondary">API Key</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Lock className="h-5 w-5 text-red-500" />
                        <div>
                          <p className="font-medium">/api/admin/*</p>
                          <p className="text-sm text-muted-foreground">Admin endpoints - admin authentication required</p>
                        </div>
                      </div>
                      <Badge variant="destructive">Admin Only</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  API Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">HTTPS Only</p>
                    <p className="text-sm text-muted-foreground">Require HTTPS for all API requests</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">API Key Rotation</p>
                    <p className="text-sm text-muted-foreground">Automatically rotate API keys every 90 days</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">IP Whitelisting</p>
                    <p className="text-sm text-muted-foreground">Only allow requests from whitelisted IPs</p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Request Signing</p>
                    <p className="text-sm text-muted-foreground">Require HMAC signature for sensitive endpoints</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>CORS Allowed Origins</Label>
                  <Input defaultValue="https://tburn.io, https://app.tburn.io" />
                  <p className="text-xs text-muted-foreground">Comma-separated list of allowed origins</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-green-500/10">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">All API keys are secure</p>
                    <p className="text-sm text-muted-foreground">No compromised or exposed keys detected</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-yellow-500/10">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="font-medium">1 API key approaching rotation</p>
                    <p className="text-sm text-muted-foreground">Development API Key - due in 15 days</p>
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
