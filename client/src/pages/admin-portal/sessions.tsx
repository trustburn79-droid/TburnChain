import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Monitor,
  Search,
  RefreshCw,
  LogOut,
  Clock,
  Globe,
  Shield,
  AlertTriangle,
  CheckCircle,
  User,
  Activity,
  Smartphone,
  Laptop,
  Tablet,
  Trash2,
  Settings,
  Key,
} from "lucide-react";

interface Session {
  id: string;
  user: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  device: string;
  deviceType: "desktop" | "mobile" | "tablet";
  browser: string;
  os: string;
  ip: string;
  location: string;
  startTime: string;
  lastActivity: string;
  status: "active" | "idle" | "expired";
  isCurrent?: boolean;
}

export default function Sessions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const sessions: Session[] = [
    {
      id: "1",
      user: { name: "John Admin", email: "john@tburn.io", role: "Super Admin" },
      device: "MacBook Pro",
      deviceType: "desktop",
      browser: "Chrome 120",
      os: "macOS Sonoma",
      ip: "192.168.1.100",
      location: "Seoul, South Korea",
      startTime: "2024-12-04 14:45:23",
      lastActivity: "Just now",
      status: "active",
      isCurrent: true,
    },
    {
      id: "2",
      user: { name: "Sarah Ops", email: "sarah@tburn.io", role: "Operator" },
      device: "Windows PC",
      deviceType: "desktop",
      browser: "Firefox 121",
      os: "Windows 11",
      ip: "192.168.1.105",
      location: "Busan, South Korea",
      startTime: "2024-12-04 13:30:00",
      lastActivity: "5 minutes ago",
      status: "active",
    },
    {
      id: "3",
      user: { name: "Mike Dev", email: "mike@tburn.io", role: "Developer" },
      device: "iPhone 15",
      deviceType: "mobile",
      browser: "Safari",
      os: "iOS 17",
      ip: "10.0.0.55",
      location: "Tokyo, Japan",
      startTime: "2024-12-04 12:00:00",
      lastActivity: "30 minutes ago",
      status: "idle",
    },
    {
      id: "4",
      user: { name: "John Admin", email: "john@tburn.io", role: "Super Admin" },
      device: "iPad Pro",
      deviceType: "tablet",
      browser: "Safari",
      os: "iPadOS 17",
      ip: "192.168.1.101",
      location: "Seoul, South Korea",
      startTime: "2024-12-03 09:00:00",
      lastActivity: "1 day ago",
      status: "expired",
    },
    {
      id: "5",
      user: { name: "Lisa Analyst", email: "lisa@tburn.io", role: "Analyst" },
      device: "ThinkPad X1",
      deviceType: "desktop",
      browser: "Edge 120",
      os: "Windows 11",
      ip: "192.168.1.110",
      location: "Incheon, South Korea",
      startTime: "2024-12-04 10:15:00",
      lastActivity: "15 minutes ago",
      status: "active",
    },
  ];

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "desktop":
        return <Laptop className="h-5 w-5" />;
      case "mobile":
        return <Smartphone className="h-5 w-5" />;
      case "tablet":
        return <Tablet className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "idle":
        return "bg-yellow-500";
      case "expired":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch = 
      session.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.ip.includes(searchQuery);
    const matchesStatus = filterStatus === "all" || session.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const activeCount = sessions.filter(s => s.status === "active").length;
  const idleCount = sessions.filter(s => s.status === "idle").length;
  const expiredCount = sessions.filter(s => s.status === "expired").length;

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Monitor className="h-8 w-8" />
              Session Management
            </h1>
            <p className="text-muted-foreground">세션 관리 | Manage active user sessions</p>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" data-testid="button-settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Session Settings
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Session Settings</DialogTitle>
                  <DialogDescription>Configure session timeout and security settings</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Session Timeout (minutes)</Label>
                    <Select defaultValue="30">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="480">8 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Concurrent Sessions</p>
                      <p className="text-sm text-muted-foreground">Allow multiple sessions per user</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Session Lock on Idle</p>
                      <p className="text-sm text-muted-foreground">Lock session after inactivity</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Device Trust</p>
                      <p className="text-sm text-muted-foreground">Remember trusted devices</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Button className="w-full">Save Settings</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="destructive" data-testid="button-terminate-all">
              <LogOut className="h-4 w-4 mr-2" />
              Terminate All
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()} data-testid="button-refresh">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sessions.length}</div>
              <p className="text-xs text-muted-foreground">Across all users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{activeCount}</div>
              <Progress value={(activeCount / sessions.length) * 100} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Idle Sessions</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{idleCount}</div>
              <p className="text-xs text-muted-foreground">Inactive for 30+ min</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired Sessions</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{expiredCount}</div>
              <p className="text-xs text-muted-foreground">Need cleanup</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user, email, or IP..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="idle">Idle</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Sessions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>View and manage all user sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.map((session) => (
                  <TableRow key={session.id} className={session.isCurrent ? "bg-primary/5" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={session.user.avatar} />
                          <AvatarFallback>{session.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{session.user.name}</p>
                            {session.isCurrent && (
                              <Badge variant="outline" className="text-xs">Current</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{session.user.email}</p>
                          <Badge variant="secondary" className="text-xs">{session.user.role}</Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(session.deviceType)}
                        <div>
                          <p className="font-medium">{session.device}</p>
                          <p className="text-xs text-muted-foreground">{session.browser} · {session.os}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p>{session.location}</p>
                          <p className="text-xs text-muted-foreground">{session.ip}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{session.startTime}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{session.lastActivity}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" disabled={session.isCurrent}>
                          <Key className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500"
                          disabled={session.isCurrent}
                        >
                          <LogOut className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Security Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-green-500/10">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">All sessions are from known locations</p>
                <p className="text-sm text-muted-foreground">No suspicious login attempts detected</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-yellow-500/10">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="font-medium">1 expired session found</p>
                <p className="text-sm text-muted-foreground">Consider terminating expired sessions for security</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
