import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  Search,
  Filter,
  RefreshCw,
  Download,
  User,
  Clock,
  Monitor,
  Globe,
  Shield,
  AlertTriangle,
  CheckCircle,
  LogIn,
  LogOut,
  Settings,
  FileText,
  Database,
  Key,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

interface ActivityLog {
  id: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  action: string;
  actionType: "login" | "logout" | "create" | "update" | "delete" | "view" | "settings" | "security";
  target: string;
  ip: string;
  device: string;
  location: string;
  timestamp: string;
  status: "success" | "failed" | "warning";
}

export default function ActivityMonitor() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [timeRange, setTimeRange] = useState("24h");

  const activityLogs: ActivityLog[] = [
    {
      id: "1",
      user: { name: "John Admin", email: "john@tburn.io" },
      action: "Logged in",
      actionType: "login",
      target: "Admin Portal",
      ip: "192.168.1.100",
      device: "Chrome on MacOS",
      location: "Seoul, KR",
      timestamp: "2024-12-04 14:45:23",
      status: "success",
    },
    {
      id: "2",
      user: { name: "Sarah Ops", email: "sarah@tburn.io" },
      action: "Modified validator settings",
      actionType: "settings",
      target: "Validator #156",
      ip: "192.168.1.105",
      device: "Firefox on Windows",
      location: "Busan, KR",
      timestamp: "2024-12-04 14:42:10",
      status: "success",
    },
    {
      id: "3",
      user: { name: "Mike Dev", email: "mike@tburn.io" },
      action: "Failed login attempt",
      actionType: "login",
      target: "Admin Portal",
      ip: "10.0.0.55",
      device: "Safari on iOS",
      location: "Unknown",
      timestamp: "2024-12-04 14:38:45",
      status: "failed",
    },
    {
      id: "4",
      user: { name: "John Admin", email: "john@tburn.io" },
      action: "Created new API key",
      actionType: "create",
      target: "API Key - Production",
      ip: "192.168.1.100",
      device: "Chrome on MacOS",
      location: "Seoul, KR",
      timestamp: "2024-12-04 14:35:12",
      status: "success",
    },
    {
      id: "5",
      user: { name: "System", email: "system@tburn.io" },
      action: "Security alert triggered",
      actionType: "security",
      target: "Rate limit exceeded",
      ip: "External",
      device: "N/A",
      location: "Multiple",
      timestamp: "2024-12-04 14:30:00",
      status: "warning",
    },
    {
      id: "6",
      user: { name: "Sarah Ops", email: "sarah@tburn.io" },
      action: "Viewed audit logs",
      actionType: "view",
      target: "Audit Logs",
      ip: "192.168.1.105",
      device: "Firefox on Windows",
      location: "Busan, KR",
      timestamp: "2024-12-04 14:25:33",
      status: "success",
    },
    {
      id: "7",
      user: { name: "John Admin", email: "john@tburn.io" },
      action: "Updated network parameters",
      actionType: "update",
      target: "Network Config",
      ip: "192.168.1.100",
      device: "Chrome on MacOS",
      location: "Seoul, KR",
      timestamp: "2024-12-04 14:20:00",
      status: "success",
    },
    {
      id: "8",
      user: { name: "Admin Bot", email: "bot@tburn.io" },
      action: "Executed scheduled backup",
      actionType: "create",
      target: "Database Backup",
      ip: "Internal",
      device: "Automated",
      location: "Server",
      timestamp: "2024-12-04 14:00:00",
      status: "success",
    },
  ];

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "login":
        return <LogIn className="h-4 w-4" />;
      case "logout":
        return <LogOut className="h-4 w-4" />;
      case "create":
        return <FileText className="h-4 w-4" />;
      case "update":
        return <Edit className="h-4 w-4" />;
      case "delete":
        return <Trash2 className="h-4 w-4" />;
      case "view":
        return <Eye className="h-4 w-4" />;
      case "settings":
        return <Settings className="h-4 w-4" />;
      case "security":
        return <Shield className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-500 bg-green-500/10";
      case "failed":
        return "text-red-500 bg-red-500/10";
      case "warning":
        return "text-yellow-500 bg-yellow-500/10";
      default:
        return "";
    }
  };

  const filteredLogs = activityLogs.filter((log) => {
    const matchesSearch = 
      log.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || log.actionType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Activity className="h-8 w-8" />
              Activity Monitor
            </h1>
            <p className="text-muted-foreground">활동 모니터링 | Track user activity and system events</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              Export
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
              <CardTitle className="text-sm font-medium">Total Activities (24h)</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-green-500">+15% from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Currently online</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Attempts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">3</div>
              <p className="text-xs text-muted-foreground">In the last 24 hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Events</CardTitle>
              <Shield className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">7</div>
              <p className="text-xs text-muted-foreground">Warnings triggered</p>
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
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  <SelectItem value="login">Login/Logout</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="view">View</SelectItem>
                  <SelectItem value="settings">Settings</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last 1 hour</SelectItem>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
            <CardDescription>Recent user and system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={log.user.avatar} />
                      <AvatarFallback>{log.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{log.user.name}</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-sm text-muted-foreground">{log.action}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {getActionIcon(log.actionType)}
                          <span className="ml-1">{log.target}</span>
                        </Badge>
                        <Badge className={`text-xs ${getStatusColor(log.status)}`}>
                          {log.status === "success" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {log.status === "failed" && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {log.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {log.timestamp}
                        </span>
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {log.ip}
                        </span>
                        <span className="flex items-center gap-1">
                          <Monitor className="h-3 w-3" />
                          {log.device}
                        </span>
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {log.location}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Currently Active Sessions</CardTitle>
            <CardDescription>Users currently logged into the system</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Session Started</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>JA</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">John Admin</p>
                        <p className="text-xs text-muted-foreground">john@tburn.io</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>192.168.1.100</TableCell>
                  <TableCell>Chrome on MacOS</TableCell>
                  <TableCell>Seoul, KR</TableCell>
                  <TableCell>2024-12-04 14:45:23</TableCell>
                  <TableCell>
                    <Badge className="bg-green-500">Active</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>SO</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Sarah Ops</p>
                        <p className="text-xs text-muted-foreground">sarah@tburn.io</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>192.168.1.105</TableCell>
                  <TableCell>Firefox on Windows</TableCell>
                  <TableCell>Busan, KR</TableCell>
                  <TableCell>2024-12-04 13:30:00</TableCell>
                  <TableCell>
                    <Badge className="bg-green-500">Active</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
