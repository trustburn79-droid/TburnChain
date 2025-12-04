import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Volume2,
  VolumeX,
  RefreshCw,
  Save,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  Clock,
  Settings,
  Plus,
  Trash2,
} from "lucide-react";
import { SiSlack, SiDiscord, SiTelegram } from "react-icons/si";

interface NotificationChannel {
  id: string;
  type: string;
  name: string;
  enabled: boolean;
  destination: string;
}

export default function NotificationSettings() {
  const [activeTab, setActiveTab] = useState("channels");
  const [saving, setSaving] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationVolume, setNotificationVolume] = useState([70]);

  const channels: NotificationChannel[] = [
    { id: "1", type: "email", name: "Admin Email", enabled: true, destination: "admin@tburn.io" },
    { id: "2", type: "slack", name: "Alerts Channel", enabled: true, destination: "#tburn-alerts" },
    { id: "3", type: "discord", name: "Dev Server", enabled: true, destination: "#dev-notifications" },
    { id: "4", type: "telegram", name: "Ops Bot", enabled: false, destination: "@tburn_ops_bot" },
    { id: "5", type: "sms", name: "On-Call Phone", enabled: true, destination: "+1-xxx-xxx-xxxx" },
  ];

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="h-5 w-5" />;
      case "slack":
        return <SiSlack className="h-5 w-5" />;
      case "discord":
        return <SiDiscord className="h-5 w-5" />;
      case "telegram":
        return <SiTelegram className="h-5 w-5" />;
      case "sms":
        return <Smartphone className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Bell className="h-8 w-8" />
              Notification Settings
            </h1>
            <p className="text-muted-foreground">알림 설정 관리 | Configure notification preferences and channels</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" data-testid="button-test-notification">
              <Bell className="h-4 w-4 mr-2" />
              Test Notification
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
              <CardTitle className="text-sm font-medium">Active Channels</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">of 5 channels enabled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notifications Sent (24h)</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">847</div>
              <p className="text-xs text-green-500">All delivered successfully</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">3</div>
              <p className="text-xs text-muted-foreground">Pending acknowledgment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Delivery Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1.2s</div>
              <p className="text-xs text-muted-foreground">Across all channels</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="channels">Channels</TabsTrigger>
            <TabsTrigger value="alerts">Alert Rules</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="channels" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Notification Channels</CardTitle>
                  <CardDescription>Configure where notifications are sent</CardDescription>
                </div>
                <Button data-testid="button-add-channel">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Channel
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {channels.map((channel) => (
                  <div key={channel.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-muted rounded-lg">
                        {getChannelIcon(channel.type)}
                      </div>
                      <div>
                        <p className="font-medium">{channel.name}</p>
                        <p className="text-sm text-muted-foreground">{channel.destination}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={channel.enabled ? "default" : "secondary"}>
                        {channel.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                      <Switch defaultChecked={channel.enabled} />
                      <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Alert Severity Routing</CardTitle>
                <CardDescription>Configure which channels receive each alert type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 border rounded-lg bg-red-500/10 border-red-500/30">
                    <XCircle className="h-6 w-6 text-red-500" />
                    <div className="flex-1">
                      <p className="font-medium text-red-500">Critical Alerts</p>
                      <p className="text-sm text-muted-foreground">System down, security breach, consensus failure</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">Email</Badge>
                      <Badge variant="outline">Slack</Badge>
                      <Badge variant="outline">SMS</Badge>
                      <Badge variant="outline">Discord</Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 border rounded-lg bg-orange-500/10 border-orange-500/30">
                    <AlertTriangle className="h-6 w-6 text-orange-500" />
                    <div className="flex-1">
                      <p className="font-medium text-orange-500">High Priority</p>
                      <p className="text-sm text-muted-foreground">Performance degradation, validator issues</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">Email</Badge>
                      <Badge variant="outline">Slack</Badge>
                      <Badge variant="outline">Discord</Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 border rounded-lg bg-yellow-500/10 border-yellow-500/30">
                    <Info className="h-6 w-6 text-yellow-500" />
                    <div className="flex-1">
                      <p className="font-medium text-yellow-500">Medium Priority</p>
                      <p className="text-sm text-muted-foreground">Resource warnings, unusual activity</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">Email</Badge>
                      <Badge variant="outline">Slack</Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 border rounded-lg bg-blue-500/10 border-blue-500/30">
                    <CheckCircle className="h-6 w-6 text-blue-500" />
                    <div className="flex-1">
                      <p className="font-medium text-blue-500">Low Priority</p>
                      <p className="text-sm text-muted-foreground">Informational updates, scheduled events</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">Slack</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Schedule</CardTitle>
                <CardDescription>Set quiet hours and delivery preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Quiet Hours</p>
                    <p className="text-sm text-muted-foreground">Only send critical alerts during these hours</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quiet Hours Start</Label>
                    <Select defaultValue="22:00">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                            {`${i.toString().padStart(2, '0')}:00`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quiet Hours End</Label>
                    <Select defaultValue="08:00">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                            {`${i.toString().padStart(2, '0')}:00`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select defaultValue="UTC">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">EST (UTC-5)</SelectItem>
                      <SelectItem value="PST">PST (UTC-8)</SelectItem>
                      <SelectItem value="KST">KST (UTC+9)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weekend Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive non-critical notifications on weekends</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>General notification settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                    <div>
                      <p className="font-medium">Sound Notifications</p>
                      <p className="text-sm text-muted-foreground">Play sound for incoming notifications</p>
                    </div>
                  </div>
                  <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                </div>

                {soundEnabled && (
                  <div className="space-y-2 pl-8">
                    <Label>Notification Volume</Label>
                    <Slider
                      value={notificationVolume}
                      onValueChange={setNotificationVolume}
                      max={100}
                      step={1}
                    />
                    <p className="text-xs text-muted-foreground">{notificationVolume[0]}%</p>
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Desktop Notifications</p>
                    <p className="text-sm text-muted-foreground">Show browser notifications</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Digest</p>
                    <p className="text-sm text-muted-foreground">Receive daily summary instead of individual emails</p>
                  </div>
                  <Switch />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Duplicate Suppression</p>
                    <p className="text-sm text-muted-foreground">Suppress repeated alerts within 5 minutes</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Alert Batch Window</Label>
                  <Select defaultValue="5">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Immediate (no batching)</SelectItem>
                      <SelectItem value="1">1 minute</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Group non-critical alerts within this window</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
