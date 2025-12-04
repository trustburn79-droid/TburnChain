import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  FileText,
  Search,
  Download,
  Filter,
  Clock,
  User,
  Activity,
  Settings,
  Shield,
  Database,
  Eye,
} from "lucide-react";

interface AuditLog {
  id: string;
  timestamp: Date;
  actor: string;
  actorRole: string;
  action: string;
  category: string;
  target: string;
  targetType: string;
  status: "success" | "failure" | "pending";
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
}

export default function AdminAuditLogs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const logs: AuditLog[] = useMemo(() => [
    { id: "1", timestamp: new Date(Date.now() - 60000), actor: "admin@tburn.io", actorRole: "Super Admin", action: "UPDATE_CONFIG", category: "configuration", target: "network_params", targetType: "config", status: "success", ipAddress: "10.0.1.5", userAgent: "Chrome/120.0", details: { field: "maxBlockSize", oldValue: "1MB", newValue: "2MB" } },
    { id: "2", timestamp: new Date(Date.now() - 300000), actor: "ops@tburn.io", actorRole: "Operator", action: "RESTART_SERVICE", category: "operations", target: "consensus_engine", targetType: "service", status: "success", ipAddress: "10.0.2.15", userAgent: "Firefox/121.0", details: { reason: "Scheduled maintenance" } },
    { id: "3", timestamp: new Date(Date.now() - 600000), actor: "security@tburn.io", actorRole: "Security", action: "BLOCK_IP", category: "security", target: "192.168.1.100", targetType: "ip_address", status: "success", ipAddress: "10.0.3.25", userAgent: "Safari/17.0", details: { reason: "Brute force attack", duration: "24h" } },
    { id: "4", timestamp: new Date(Date.now() - 900000), actor: "admin@tburn.io", actorRole: "Super Admin", action: "CREATE_USER", category: "user_management", target: "new_operator@tburn.io", targetType: "user", status: "success", ipAddress: "10.0.1.5", userAgent: "Chrome/120.0", details: { role: "Operator", permissions: ["read", "write"] } },
    { id: "5", timestamp: new Date(Date.now() - 1200000), actor: "dev@tburn.io", actorRole: "Developer", action: "DEPLOY_CONTRACT", category: "development", target: "0xabcd...ef01", targetType: "contract", status: "failure", ipAddress: "10.0.4.35", userAgent: "Chrome/120.0", details: { error: "Gas estimation failed", contractName: "TokenBridge" } },
    { id: "6", timestamp: new Date(Date.now() - 1800000), actor: "ops@tburn.io", actorRole: "Operator", action: "PAUSE_BRIDGE", category: "operations", target: "arbitrum_bridge", targetType: "bridge", status: "success", ipAddress: "10.0.2.15", userAgent: "Firefox/121.0", details: { reason: "High latency detected" } },
    { id: "7", timestamp: new Date(Date.now() - 3600000), actor: "admin@tburn.io", actorRole: "Super Admin", action: "UPDATE_ROLE", category: "user_management", target: "ops@tburn.io", targetType: "user", status: "success", ipAddress: "10.0.1.5", userAgent: "Chrome/120.0", details: { oldRole: "Viewer", newRole: "Operator" } },
    { id: "8", timestamp: new Date(Date.now() - 7200000), actor: "system", actorRole: "System", action: "AUTO_BACKUP", category: "system", target: "database", targetType: "backup", status: "success", ipAddress: "localhost", userAgent: "System", details: { size: "2.4GB", duration: "45s" } },
  ], []);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = searchQuery === "" ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.target.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || log.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || log.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [logs, searchQuery, categoryFilter, statusFilter]);

  const categories = useMemo(() => [
    { value: "all", label: "All Categories" },
    { value: "configuration", label: "Configuration" },
    { value: "operations", label: "Operations" },
    { value: "security", label: "Security" },
    { value: "user_management", label: "User Management" },
    { value: "development", label: "Development" },
    { value: "system", label: "System" },
  ], []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success": return <Badge className="bg-green-500/10 text-green-500">Success</Badge>;
      case "failure": return <Badge className="bg-red-500/10 text-red-500">Failure</Badge>;
      case "pending": return <Badge className="bg-yellow-500/10 text-yellow-500">Pending</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "configuration": return <Settings className="h-4 w-4" />;
      case "operations": return <Activity className="h-4 w-4" />;
      case "security": return <Shield className="h-4 w-4" />;
      case "user_management": return <User className="h-4 w-4" />;
      case "development": return <Database className="h-4 w-4" />;
      case "system": return <Database className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString();
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="h-8 w-8" />
              Audit Logs
            </h1>
            <p className="text-muted-foreground">Track all administrative actions and system events</p>
          </div>
          <Button variant="outline" data-testid="button-export-logs">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <CardTitle>Activity Log</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[250px]"
                    data-testid="input-log-search"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failure">Failure</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-lg border hover-elevate cursor-pointer"
                    onClick={() => setSelectedLog(log)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          {getCategoryIcon(log.category)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{log.action}</span>
                            {getStatusBadge(log.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">{log.actor}</span>
                            {" - "}
                            <span>{log.actorRole}</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Target: {log.target} ({log.targetType})
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(log.timestamp)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{log.ipAddress}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Log Details
              </DialogTitle>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Action</p>
                    <p className="font-medium">{selectedLog.action}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    {getStatusBadge(selectedLog.status)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Actor</p>
                    <p className="font-medium">{selectedLog.actor}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <p className="font-medium">{selectedLog.actorRole}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Target</p>
                    <p className="font-medium font-mono text-sm">{selectedLog.target}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Target Type</p>
                    <p className="font-medium">{selectedLog.targetType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Timestamp</p>
                    <p className="font-medium">{formatTimestamp(selectedLog.timestamp)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">IP Address</p>
                    <p className="font-medium font-mono">{selectedLog.ipAddress}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">User Agent</p>
                  <p className="font-mono text-xs p-2 rounded bg-muted">{selectedLog.userAgent}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Details</p>
                  <pre className="p-4 rounded-lg bg-muted text-xs overflow-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
