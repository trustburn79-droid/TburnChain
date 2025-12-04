import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  Filter,
  Search,
  Shield,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface Alert {
  id: string;
  type: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  message: string;
  timestamp: Date;
  status: "active" | "acknowledged" | "resolved";
  source: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, any>;
}

export default function AdminAlerts() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [resolution, setResolution] = useState("");

  const alerts: Alert[] = useMemo(() => [
    { id: "1", type: "security", severity: "critical", title: "Suspicious Activity Detected", message: "Multiple failed login attempts from IP 192.168.1.100. Possible brute force attack detected.", timestamp: new Date(Date.now() - 300000), status: "active", source: "Security Monitor", targetType: "system", metadata: { ip: "192.168.1.100", attempts: 15 } },
    { id: "2", type: "validator", severity: "high", title: "Validator Offline", message: "Validator 0x7890...cdef has been offline for 15 minutes. May impact consensus.", timestamp: new Date(Date.now() - 900000), status: "active", source: "Validator Monitor", targetType: "validator", targetId: "0x7890cdef" },
    { id: "3", type: "bridge", severity: "medium", title: "Arbitrum Bridge Degraded", message: "Increased latency on Arbitrum bridge connections. Average latency: 285ms (threshold: 200ms).", timestamp: new Date(Date.now() - 1800000), status: "acknowledged", source: "Bridge Monitor", targetType: "bridge", targetId: "arbitrum" },
    { id: "4", type: "ai", severity: "medium", title: "AI Model Retraining Required", message: "GPT-5 model accuracy dropped below 95%. Automatic retraining initiated.", timestamp: new Date(Date.now() - 3600000), status: "acknowledged", source: "AI Orchestrator", targetType: "ai_model", targetId: "gpt5" },
    { id: "5", type: "system", severity: "low", title: "Scheduled Maintenance", message: "Database optimization scheduled for tonight at 02:00 UTC.", timestamp: new Date(Date.now() - 7200000), status: "active", source: "System Scheduler" },
    { id: "6", type: "network", severity: "high", title: "High Network Latency", message: "Network latency spike detected on Shard 3. Current: 165ms (threshold: 150ms).", timestamp: new Date(Date.now() - 10800000), status: "resolved", source: "Network Monitor", targetType: "shard", targetId: "3" },
    { id: "7", type: "security", severity: "medium", title: "API Key Near Expiration", message: "API key 'prod-analytics' expires in 7 days. Please rotate.", timestamp: new Date(Date.now() - 14400000), status: "active", source: "Key Manager" },
    { id: "8", type: "validator", severity: "low", title: "Validator Commission Change", message: "Validator 0x1234...5678 changed commission from 5% to 7%.", timestamp: new Date(Date.now() - 18000000), status: "resolved", source: "Validator Monitor", targetType: "validator", targetId: "0x12345678" },
  ], []);

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const matchesSearch = searchQuery === "" ||
        alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.message.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeverity = severityFilter === "all" || alert.severity === severityFilter;
      const matchesStatus = statusFilter === "all" || alert.status === statusFilter;
      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [alerts, searchQuery, severityFilter, statusFilter]);

  const alertCounts = useMemo(() => ({
    critical: alerts.filter(a => a.severity === "critical" && a.status !== "resolved").length,
    high: alerts.filter(a => a.severity === "high" && a.status !== "resolved").length,
    medium: alerts.filter(a => a.severity === "medium" && a.status !== "resolved").length,
    low: alerts.filter(a => a.severity === "low" && a.status !== "resolved").length,
    total: alerts.filter(a => a.status !== "resolved").length,
  }), [alerts]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-red-500 bg-red-500/10";
      case "high": return "text-orange-500 bg-orange-500/10";
      case "medium": return "text-yellow-500 bg-yellow-500/10";
      case "low": return "text-blue-500 bg-blue-500/10";
      default: return "text-muted-foreground bg-muted";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-red-500/10 text-red-500">Active</Badge>;
      case "acknowledged":
        return <Badge className="bg-yellow-500/10 text-yellow-500">Acknowledged</Badge>;
      case "resolved":
        return <Badge className="bg-green-500/10 text-green-500">Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleAcknowledge = (alertId: string) => {
    console.log("Acknowledging alert:", alertId);
  };

  const handleResolve = () => {
    if (selectedAlert) {
      console.log("Resolving alert:", selectedAlert.id, "with resolution:", resolution);
      setSelectedAlert(null);
      setResolution("");
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Bell className="h-8 w-8" />
              Alert Center
            </h1>
            <p className="text-muted-foreground">Monitor and manage system alerts and notifications</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="cursor-pointer hover-elevate" onClick={() => setSeverityFilter("all")}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Active</p>
                  <p className="text-2xl font-bold">{alertCounts.total}</p>
                </div>
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover-elevate" onClick={() => setSeverityFilter("critical")}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-500">Critical</p>
                  <p className="text-2xl font-bold text-red-500">{alertCounts.critical}</p>
                </div>
                <ShieldAlert className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover-elevate" onClick={() => setSeverityFilter("high")}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-500">High</p>
                  <p className="text-2xl font-bold text-orange-500">{alertCounts.high}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover-elevate" onClick={() => setSeverityFilter("medium")}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-500">Medium</p>
                  <p className="text-2xl font-bold text-yellow-500">{alertCounts.medium}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover-elevate" onClick={() => setSeverityFilter("low")}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-500">Low</p>
                  <p className="text-2xl font-bold text-blue-500">{alertCounts.low}</p>
                </div>
                <Bell className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <CardTitle>Alerts</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search alerts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[250px]"
                    data-testid="input-alert-search"
                  />
                </div>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {filteredAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 rounded-lg border hover-elevate cursor-pointer"
                    onClick={() => setSelectedAlert(alert)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-medium">{alert.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(alert.status)}
                            <Badge variant="outline" className="uppercase text-xs">
                              {alert.severity}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(alert.timestamp)}
                          </span>
                          <span>Source: {alert.source}</span>
                          {alert.targetType && (
                            <span>Target: {alert.targetType}</span>
                          )}
                        </div>
                      </div>
                      {alert.status === "active" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcknowledge(alert.id);
                          }}
                          data-testid={`button-acknowledge-${alert.id}`}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Acknowledge
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {filteredAlerts.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No alerts found matching your criteria</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className={`h-5 w-5 ${selectedAlert?.severity === "critical" ? "text-red-500" : selectedAlert?.severity === "high" ? "text-orange-500" : "text-yellow-500"}`} />
                {selectedAlert?.title}
              </DialogTitle>
              <DialogDescription>
                Alert ID: {selectedAlert?.id} | Source: {selectedAlert?.source}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {selectedAlert && getStatusBadge(selectedAlert.status)}
                <Badge variant="outline" className="uppercase">
                  {selectedAlert?.severity}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {selectedAlert && formatTimeAgo(selectedAlert.timestamp)}
                </span>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm">{selectedAlert?.message}</p>
              </div>
              {selectedAlert?.metadata && (
                <div>
                  <h4 className="font-medium mb-2">Additional Details</h4>
                  <pre className="p-4 rounded-lg bg-muted/50 text-xs overflow-auto">
                    {JSON.stringify(selectedAlert.metadata, null, 2)}
                  </pre>
                </div>
              )}
              {selectedAlert?.status !== "resolved" && (
                <div>
                  <h4 className="font-medium mb-2">Resolution Notes</h4>
                  <Textarea
                    placeholder="Enter resolution details..."
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedAlert(null)}>
                Close
              </Button>
              {selectedAlert?.status === "active" && (
                <Button variant="secondary" onClick={() => handleAcknowledge(selectedAlert.id)}>
                  <Check className="h-4 w-4 mr-1" />
                  Acknowledge
                </Button>
              )}
              {selectedAlert?.status !== "resolved" && (
                <Button onClick={handleResolve} disabled={!resolution}>
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Resolve
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
