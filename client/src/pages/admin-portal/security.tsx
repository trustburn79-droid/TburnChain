import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Key,
  AlertTriangle,
  Eye,
  Users,
  Activity,
  Globe,
  Clock,
} from "lucide-react";

export default function AdminSecurity() {
  const [activeTab, setActiveTab] = useState("overview");

  const securityScore = useMemo(() => ({
    overall: 94,
    authentication: 98,
    authorization: 92,
    encryption: 96,
    monitoring: 91,
    compliance: 95,
  }), []);

  const threatEvents = useMemo(() => [
    { id: 1, type: "Brute Force", severity: "high", source: "192.168.1.100", target: "/api/auth/login", attempts: 15, status: "blocked", time: new Date(Date.now() - 300000) },
    { id: 2, type: "SQL Injection", severity: "critical", source: "10.0.5.23", target: "/api/search", attempts: 3, status: "blocked", time: new Date(Date.now() - 1200000) },
    { id: 3, type: "DDoS Attempt", severity: "medium", source: "Multiple", target: "/api/*", attempts: 1247, status: "mitigated", time: new Date(Date.now() - 3600000) },
    { id: 4, type: "Suspicious Access", severity: "low", source: "10.0.3.45", target: "/admin/*", attempts: 2, status: "monitored", time: new Date(Date.now() - 7200000) },
    { id: 5, type: "Invalid Token", severity: "low", source: "10.0.8.12", target: "/api/wallet", attempts: 5, status: "blocked", time: new Date(Date.now() - 14400000) },
  ], []);

  const activeSessions = useMemo(() => [
    { id: 1, user: "admin@tburn.io", role: "Super Admin", ip: "10.0.1.5", location: "US-East", device: "Chrome/Windows", lastActivity: new Date(Date.now() - 60000) },
    { id: 2, user: "ops@tburn.io", role: "Operator", ip: "10.0.2.15", location: "EU-West", device: "Firefox/macOS", lastActivity: new Date(Date.now() - 300000) },
    { id: 3, user: "security@tburn.io", role: "Security", ip: "10.0.3.25", location: "AP-East", device: "Safari/macOS", lastActivity: new Date(Date.now() - 900000) },
    { id: 4, user: "dev@tburn.io", role: "Developer", ip: "10.0.4.35", location: "US-West", device: "Chrome/Linux", lastActivity: new Date(Date.now() - 1800000) },
  ], []);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical": return <Badge className="bg-red-500/10 text-red-500">Critical</Badge>;
      case "high": return <Badge className="bg-orange-500/10 text-orange-500">High</Badge>;
      case "medium": return <Badge className="bg-yellow-500/10 text-yellow-500">Medium</Badge>;
      case "low": return <Badge className="bg-blue-500/10 text-blue-500">Low</Badge>;
      default: return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "blocked": return <Badge className="bg-green-500/10 text-green-500">Blocked</Badge>;
      case "mitigated": return <Badge className="bg-blue-500/10 text-blue-500">Mitigated</Badge>;
      case "monitored": return <Badge className="bg-yellow-500/10 text-yellow-500">Monitored</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Security Dashboard
            </h1>
            <p className="text-muted-foreground">Monitor security status and threat detection</p>
          </div>
          <Button data-testid="button-run-security-scan">
            <ShieldCheck className="h-4 w-4 mr-2" />
            Run Security Scan
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {Object.entries(securityScore).map(([key, value]) => (
            <Card key={key}>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className={`text-2xl font-bold ${value >= 95 ? "text-green-500" : value >= 90 ? "text-yellow-500" : "text-red-500"}`}>
                    {value}%
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">{key}</p>
                </div>
                <Progress value={value} className="h-1 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="threats">Threat Events</TabsTrigger>
            <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
            <TabsTrigger value="access">Access Control</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5" />
                    Recent Threats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {threatEvents.map((event) => (
                        <div key={event.id} className="p-3 rounded-lg border hover-elevate">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className={`h-4 w-4 ${event.severity === "critical" ? "text-red-500" : event.severity === "high" ? "text-orange-500" : "text-yellow-500"}`} />
                              <span className="font-medium">{event.type}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getSeverityBadge(event.severity)}
                              {getStatusBadge(event.status)}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div className="flex justify-between">
                              <span>Source: {event.source}</span>
                              <span>Attempts: {event.attempts}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Target: {event.target}</span>
                              <span>{formatTimeAgo(event.time)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Active Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {activeSessions.map((session) => (
                        <div key={session.id} className="p-3 rounded-lg border hover-elevate">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium">{session.user}</p>
                              <p className="text-xs text-muted-foreground">{session.role}</p>
                            </div>
                            <Badge variant="outline">{session.location}</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground flex justify-between">
                            <span>{session.device}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTimeAgo(session.lastActivity)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="threats">
            <Card>
              <CardHeader>
                <CardTitle>Threat Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Type</th>
                        <th className="text-left py-3 px-4 font-medium">Severity</th>
                        <th className="text-left py-3 px-4 font-medium">Source</th>
                        <th className="text-left py-3 px-4 font-medium">Target</th>
                        <th className="text-right py-3 px-4 font-medium">Attempts</th>
                        <th className="text-center py-3 px-4 font-medium">Status</th>
                        <th className="text-right py-3 px-4 font-medium">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {threatEvents.map((event) => (
                        <tr key={event.id} className="border-b hover-elevate">
                          <td className="py-3 px-4 font-medium">{event.type}</td>
                          <td className="py-3 px-4">{getSeverityBadge(event.severity)}</td>
                          <td className="py-3 px-4 font-mono text-xs">{event.source}</td>
                          <td className="py-3 px-4 font-mono text-xs">{event.target}</td>
                          <td className="py-3 px-4 text-right">{event.attempts}</td>
                          <td className="py-3 px-4 text-center">{getStatusBadge(event.status)}</td>
                          <td className="py-3 px-4 text-right text-muted-foreground">{formatTimeAgo(event.time)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Active Sessions</CardTitle>
                  <Button variant="outline" size="sm">Terminate All</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">User</th>
                        <th className="text-left py-3 px-4 font-medium">Role</th>
                        <th className="text-left py-3 px-4 font-medium">IP Address</th>
                        <th className="text-left py-3 px-4 font-medium">Location</th>
                        <th className="text-left py-3 px-4 font-medium">Device</th>
                        <th className="text-right py-3 px-4 font-medium">Last Activity</th>
                        <th className="text-center py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeSessions.map((session) => (
                        <tr key={session.id} className="border-b hover-elevate">
                          <td className="py-3 px-4 font-medium">{session.user}</td>
                          <td className="py-3 px-4"><Badge variant="outline">{session.role}</Badge></td>
                          <td className="py-3 px-4 font-mono text-xs">{session.ip}</td>
                          <td className="py-3 px-4">{session.location}</td>
                          <td className="py-3 px-4 text-xs">{session.device}</td>
                          <td className="py-3 px-4 text-right text-muted-foreground">{formatTimeAgo(session.lastActivity)}</td>
                          <td className="py-3 px-4 text-center">
                            <Button size="sm" variant="ghost" className="text-red-500">Terminate</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="access">
            <Card>
              <CardHeader>
                <CardTitle>Access Control Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Authentication Settings
                    </h3>
                    <div className="space-y-2">
                      {[
                        { label: "Two-Factor Authentication", enabled: true },
                        { label: "Session Timeout (30 min)", enabled: true },
                        { label: "IP Whitelist", enabled: true },
                        { label: "Biometric Login", enabled: false },
                      ].map((setting, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                          <span className="text-sm">{setting.label}</span>
                          <Badge className={setting.enabled ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}>
                            {setting.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-medium flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      API Security
                    </h3>
                    <div className="space-y-2">
                      {[
                        { label: "Rate Limiting", enabled: true },
                        { label: "Request Validation", enabled: true },
                        { label: "CORS Protection", enabled: true },
                        { label: "API Key Rotation (90 days)", enabled: true },
                      ].map((setting, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                          <span className="text-sm">{setting.label}</span>
                          <Badge className={setting.enabled ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}>
                            {setting.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      ))}
                    </div>
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
