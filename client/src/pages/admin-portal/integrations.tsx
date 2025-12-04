import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Plug,
  RefreshCw,
  Plus,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Link,
  Unlink,
  ExternalLink,
  Database,
  Cloud,
  MessageSquare,
  Mail,
  Bell,
  Lock,
  Activity,
  Zap,
  Save,
} from "lucide-react";
import { SiSlack, SiDiscord, SiGithub, SiTelegram, SiAmazon, SiGooglecloud } from "react-icons/si";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "connected" | "disconnected" | "error";
  lastSync?: string;
  icon: any;
  config?: Record<string, string>;
}

export default function Integrations() {
  const [activeTab, setActiveTab] = useState("all");
  const [saving, setSaving] = useState(false);

  const integrations: Integration[] = [
    {
      id: "1",
      name: "Slack",
      description: "Send alerts and notifications to Slack channels",
      category: "messaging",
      status: "connected",
      lastSync: "2024-12-04 14:30:00",
      icon: SiSlack,
    },
    {
      id: "2",
      name: "Discord",
      description: "Community notifications and bot integration",
      category: "messaging",
      status: "connected",
      lastSync: "2024-12-04 14:25:00",
      icon: SiDiscord,
    },
    {
      id: "3",
      name: "Telegram",
      description: "Telegram bot for alerts and commands",
      category: "messaging",
      status: "disconnected",
      icon: SiTelegram,
    },
    {
      id: "4",
      name: "GitHub",
      description: "Repository and deployment integration",
      category: "development",
      status: "connected",
      lastSync: "2024-12-04 10:00:00",
      icon: SiGithub,
    },
    {
      id: "5",
      name: "AWS",
      description: "Amazon Web Services infrastructure",
      category: "cloud",
      status: "connected",
      lastSync: "2024-12-04 14:00:00",
      icon: SiAmazon,
    },
    {
      id: "6",
      name: "Google Cloud",
      description: "Google Cloud Platform services",
      category: "cloud",
      status: "error",
      lastSync: "2024-12-03 18:00:00",
      icon: SiGooglecloud,
    },
    {
      id: "7",
      name: "Azure",
      description: "Microsoft Azure cloud services",
      category: "cloud",
      status: "disconnected",
      icon: Cloud,
    },
  ];

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "text-green-500";
      case "error":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Unlink className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const filteredIntegrations = activeTab === "all" 
    ? integrations 
    : integrations.filter(i => i.category === activeTab);

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Plug className="h-8 w-8" />
              Integrations
            </h1>
            <p className="text-muted-foreground">통합 설정 관리 | Manage third-party service integrations</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.reload()} data-testid="button-refresh">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync All
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
              <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
              <Plug className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">Configured services</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connected</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">4</div>
              <p className="text-xs text-muted-foreground">Active connections</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disconnected</CardTitle>
              <Unlink className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">Inactive services</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Errors</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">1</div>
              <p className="text-xs text-muted-foreground">Needs attention</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="messaging">Messaging</TabsTrigger>
            <TabsTrigger value="cloud">Cloud</TabsTrigger>
            <TabsTrigger value="development">Development</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredIntegrations.map((integration) => (
                <Card key={integration.id} className="relative">
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <integration.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <CardDescription className="text-sm">{integration.description}</CardDescription>
                      </div>
                    </div>
                    {getStatusIcon(integration.status)}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge variant={integration.status === "connected" ? "default" : integration.status === "error" ? "destructive" : "secondary"}>
                        {integration.status}
                      </Badge>
                    </div>
                    {integration.lastSync && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Last Sync</span>
                        <span className="text-sm">{integration.lastSync}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex gap-2">
                      {integration.status === "connected" ? (
                        <>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Settings className="h-4 w-4 mr-1" />
                            Configure
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 text-red-500">
                            <Unlink className="h-4 w-4 mr-1" />
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" className="flex-1">
                          <Link className="h-4 w-4 mr-1" />
                          Connect
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add New Integration Card */}
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] gap-4">
                  <div className="p-4 bg-muted rounded-full">
                    <Plus className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">Add New Integration</p>
                    <p className="text-sm text-muted-foreground">Connect a new third-party service</p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">Browse Integrations</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Available Integrations</DialogTitle>
                        <DialogDescription>Select a service to integrate with TBURN</DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="p-4 border rounded-lg hover:bg-muted cursor-pointer flex items-center gap-3">
                          <Database className="h-8 w-8" />
                          <div>
                            <p className="font-medium">PostgreSQL</p>
                            <p className="text-sm text-muted-foreground">Database integration</p>
                          </div>
                        </div>
                        <div className="p-4 border rounded-lg hover:bg-muted cursor-pointer flex items-center gap-3">
                          <Mail className="h-8 w-8" />
                          <div>
                            <p className="font-medium">SendGrid</p>
                            <p className="text-sm text-muted-foreground">Email service</p>
                          </div>
                        </div>
                        <div className="p-4 border rounded-lg hover:bg-muted cursor-pointer flex items-center gap-3">
                          <Activity className="h-8 w-8" />
                          <div>
                            <p className="font-medium">Datadog</p>
                            <p className="text-sm text-muted-foreground">Monitoring</p>
                          </div>
                        </div>
                        <div className="p-4 border rounded-lg hover:bg-muted cursor-pointer flex items-center gap-3">
                          <Lock className="h-8 w-8" />
                          <div>
                            <p className="font-medium">Auth0</p>
                            <p className="text-sm text-muted-foreground">Authentication</p>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Webhook Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Webhook Configuration
            </CardTitle>
            <CardDescription>Configure incoming and outgoing webhooks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Incoming Webhook URL</Label>
                <div className="flex gap-2">
                  <Input defaultValue="https://api.tburn.io/webhooks/incoming/abc123" readOnly />
                  <Button variant="outline" size="icon">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Use this URL to receive events from external services</p>
              </div>
              <div className="space-y-2">
                <Label>Webhook Secret</Label>
                <div className="flex gap-2">
                  <Input type="password" defaultValue="whsec_xxxxxxxxxxxxx" />
                  <Button variant="outline">Regenerate</Button>
                </div>
                <p className="text-xs text-muted-foreground">Used to verify webhook signatures</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Outgoing Webhook Events</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">Block Created</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">Transaction</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">Alert Triggered</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">Validator Update</span>
                  <Switch />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
