import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Settings,
  Edit,
  Trash2,
  Copy,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Mail,
  MessageSquare,
  Smartphone,
  Webhook,
  Activity,
  TrendingUp,
} from "lucide-react";

interface AlertRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  severity: "critical" | "high" | "medium" | "low";
  enabled: boolean;
  notifications: string[];
  lastTriggered: string | null;
  triggerCount: number;
  category: string;
  cooldown: number;
}

export default function AlertRules() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const alertRules: AlertRule[] = [
    {
      id: "rule-001",
      name: "High TPS Drop",
      description: "Alert when TPS drops below 100,000",
      condition: "tburn_tps_current < 100000",
      severity: "critical",
      enabled: true,
      notifications: ["email", "slack", "pagerduty"],
      lastTriggered: null,
      triggerCount: 0,
      category: "performance",
      cooldown: 300,
    },
    {
      id: "rule-002",
      name: "Consensus Timeout",
      description: "Alert when consensus time exceeds 500ms",
      condition: "tburn_consensus_time_ms > 500",
      severity: "high",
      enabled: true,
      notifications: ["email", "slack"],
      lastTriggered: "2024-12-03T10:30:00Z",
      triggerCount: 3,
      category: "consensus",
      cooldown: 600,
    },
    {
      id: "rule-003",
      name: "Validator Offline",
      description: "Alert when validator count drops below 100",
      condition: "tburn_validator_count < 100",
      severity: "critical",
      enabled: true,
      notifications: ["email", "slack", "sms", "pagerduty"],
      lastTriggered: null,
      triggerCount: 0,
      category: "validators",
      cooldown: 120,
    },
    {
      id: "rule-004",
      name: "High CPU Usage",
      description: "Alert when CPU usage exceeds 90%",
      condition: "tburn_cpu_usage_percent > 90",
      severity: "high",
      enabled: true,
      notifications: ["email", "slack"],
      lastTriggered: "2024-12-02T15:45:00Z",
      triggerCount: 12,
      category: "resources",
      cooldown: 300,
    },
    {
      id: "rule-005",
      name: "Memory Pressure",
      description: "Alert when memory usage exceeds 85%",
      condition: "tburn_memory_usage_percent > 85",
      severity: "medium",
      enabled: true,
      notifications: ["email"],
      lastTriggered: "2024-12-01T08:20:00Z",
      triggerCount: 5,
      category: "resources",
      cooldown: 600,
    },
    {
      id: "rule-006",
      name: "Bridge Delay",
      description: "Alert when bridge transfer time exceeds 10 minutes",
      condition: "tburn_bridge_transfer_time_seconds > 600",
      severity: "medium",
      enabled: false,
      notifications: ["email", "slack"],
      lastTriggered: null,
      triggerCount: 0,
      category: "bridge",
      cooldown: 900,
    },
    {
      id: "rule-007",
      name: "AI Error Rate",
      description: "Alert when AI error rate exceeds 5%",
      condition: "tburn_ai_error_rate_percent > 5",
      severity: "high",
      enabled: true,
      notifications: ["email", "slack", "webhook"],
      lastTriggered: null,
      triggerCount: 0,
      category: "ai",
      cooldown: 300,
    },
    {
      id: "rule-008",
      name: "Mempool Congestion",
      description: "Alert when pending transactions exceed 10,000",
      condition: "tburn_tx_pending > 10000",
      severity: "medium",
      enabled: true,
      notifications: ["slack"],
      lastTriggered: "2024-12-03T09:15:00Z",
      triggerCount: 2,
      category: "transactions",
      cooldown: 300,
    },
  ];

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "performance", label: "Performance" },
    { value: "consensus", label: "Consensus" },
    { value: "validators", label: "Validators" },
    { value: "resources", label: "Resources" },
    { value: "bridge", label: "Bridge" },
    { value: "ai", label: "AI Systems" },
    { value: "transactions", label: "Transactions" },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "email": return <Mail className="h-3 w-3" />;
      case "slack": return <MessageSquare className="h-3 w-3" />;
      case "sms": return <Smartphone className="h-3 w-3" />;
      case "pagerduty": return <Bell className="h-3 w-3" />;
      case "webhook": return <Webhook className="h-3 w-3" />;
      default: return <Bell className="h-3 w-3" />;
    }
  };

  const filteredRules = alertRules.filter((rule) => {
    const matchesSearch = 
      rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || rule.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const enabledCount = alertRules.filter(r => r.enabled).length;
  const criticalCount = alertRules.filter(r => r.severity === "critical" && r.enabled).length;
  const triggeredToday = alertRules.filter(r => {
    if (!r.lastTriggered) return false;
    const triggered = new Date(r.lastTriggered);
    const today = new Date();
    return triggered.toDateString() === today.toDateString();
  }).length;

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Bell className="h-8 w-8" />
              Alert Rules
            </h1>
            <p className="text-muted-foreground">Configure and manage alerting rules</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" data-testid="button-test-alerts">
              <Play className="h-4 w-4 mr-2" />
              Test All
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-rule">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Rule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Alert Rule</DialogTitle>
                  <DialogDescription>Define a new alerting rule</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rule-name">Rule Name</Label>
                      <Input id="rule-name" placeholder="e.g., High CPU Alert" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rule-category">Category</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.slice(1).map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rule-description">Description</Label>
                    <Textarea id="rule-description" placeholder="Describe the alert rule..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rule-condition">Condition (PromQL)</Label>
                    <Input 
                      id="rule-condition" 
                      placeholder="e.g., tburn_cpu_usage_percent > 90"
                      className="font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Severity</Label>
                      <Select defaultValue="medium">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rule-cooldown">Cooldown (seconds)</Label>
                      <Input id="rule-cooldown" type="number" defaultValue={300} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Notification Channels</Label>
                    <div className="flex flex-wrap gap-2">
                      {["Email", "Slack", "SMS", "PagerDuty", "Webhook"].map((channel) => (
                        <Button key={channel} variant="outline" size="sm">
                          {channel}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                  <Button onClick={() => setIsCreateDialogOpen(false)}>Create Rule</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Rules</p>
                  <p className="text-2xl font-bold">{enabledCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Critical Rules</p>
                  <p className="text-2xl font-bold">{criticalCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Triggered Today</p>
                  <p className="text-2xl font-bold">{triggeredToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Triggers</p>
                  <p className="text-2xl font-bold">{alertRules.reduce((sum, r) => sum + r.triggerCount, 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle>Alert Rules</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search rules..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-rules"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40" data-testid="select-category">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Notifications</TableHead>
                  <TableHead>Last Triggered</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <Switch
                        checked={rule.enabled}
                        data-testid={`switch-rule-${rule.id}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{rule.name}</p>
                        <p className="text-xs text-muted-foreground">{rule.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{rule.condition}</code>
                    </TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(rule.severity)}>
                        {rule.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {rule.notifications.map((notif) => (
                          <Badge key={notif} variant="outline" className="gap-1">
                            {getNotificationIcon(notif)}
                            {notif}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {rule.lastTriggered ? (
                        <span className="text-sm">
                          {new Date(rule.lastTriggered).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{rule.triggerCount}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon">
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive">
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

        <Card>
          <CardHeader>
            <CardTitle>Notification Channels</CardTitle>
            <CardDescription>Configure where alerts are sent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    <span className="font-medium">Email</span>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground">5 recipients configured</p>
                <Button variant="outline" size="sm" className="w-full">Configure</Button>
              </div>
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    <span className="font-medium">Slack</span>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground">#alerts channel</p>
                <Button variant="outline" size="sm" className="w-full">Configure</Button>
              </div>
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    <span className="font-medium">SMS</span>
                  </div>
                  <Badge variant="secondary">Inactive</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Not configured</p>
                <Button variant="outline" size="sm" className="w-full">Configure</Button>
              </div>
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    <span className="font-medium">PagerDuty</span>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Service: TBURN-Mainnet</p>
                <Button variant="outline" size="sm" className="w-full">Configure</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
