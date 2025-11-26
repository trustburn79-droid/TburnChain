import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, ShieldAlert, ShieldCheck, AlertTriangle, 
  CheckCircle2, Clock, Eye, Plus, ChevronLeft, ChevronRight,
  Activity, FileWarning
} from "lucide-react";
import { useAdminPassword } from "@/hooks/use-admin-password";
import { queryClient } from "@/lib/queryClient";

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string;
  target_type: string;
  target_id: string | null;
  target_address: string | null;
  source_ip: string | null;
  description: string;
  evidence: any;
  status: string;
  resolution: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  occurred_at: string;
  detected_at: string;
}

interface AuditLog {
  id: string;
  operator_id: string;
  operator_ip: string | null;
  action_type: string;
  action_category: string;
  resource: string;
  resource_id: string | null;
  previous_state: any;
  new_state: any;
  reason: string | null;
  risk_level: string;
  created_at: string;
}

interface SecurityEventsResponse {
  events: SecurityEvent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface AuditLogsResponse {
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function OperatorSecurity() {
  const { toast } = useToast();
  const { getAuthHeaders } = useAdminPassword();
  const [activeTab, setActiveTab] = useState("events");
  const [page, setPage] = useState(1);
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [resolution, setResolution] = useState("");
  const [newEvent, setNewEvent] = useState({
    eventType: "",
    severity: "medium",
    targetType: "member",
    targetId: "",
    targetAddress: "",
    description: "",
  });

  const buildEventsQuery = () => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", "20");
    if (severityFilter !== "all") params.set("severity", severityFilter);
    if (statusFilter !== "all") params.set("status", statusFilter);
    return params.toString();
  };

  const buildAuditQuery = () => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", "50");
    if (riskFilter !== "all") params.set("riskLevel", riskFilter);
    return params.toString();
  };

  const { data: eventsData, isLoading: eventsLoading } = useQuery<SecurityEventsResponse>({
    queryKey: ["/api/operator/security-events", page, severityFilter, statusFilter],
    queryFn: async () => {
      const response = await fetch(`/api/operator/security-events?${buildEventsQuery()}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch security events");
      return response.json();
    },
    enabled: activeTab === "events",
  });

  const { data: auditData, isLoading: auditLoading } = useQuery<AuditLogsResponse>({
    queryKey: ["/api/operator/audit-logs", page, riskFilter],
    queryFn: async () => {
      const response = await fetch(`/api/operator/audit-logs?${buildAuditQuery()}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch audit logs");
      return response.json();
    },
    enabled: activeTab === "audit",
  });

  const createEventMutation = useMutation({
    mutationFn: async (event: typeof newEvent) => {
      const response = await fetch("/api/operator/security-events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(event),
      });
      if (!response.ok) throw new Error("Failed to create security event");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Security event created" });
      queryClient.invalidateQueries({ queryKey: ["/api/operator/security-events"] });
      setShowCreateDialog(false);
      setNewEvent({
        eventType: "",
        severity: "medium",
        targetType: "member",
        targetId: "",
        targetAddress: "",
        description: "",
      });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create event", description: error.message, variant: "destructive" });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ id, resolution }: { id: string; resolution: string }) => {
      const response = await fetch(`/api/operator/security-events/${id}/resolve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ resolution, status: "resolved" }),
      });
      if (!response.ok) throw new Error("Failed to resolve event");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Event resolved" });
      queryClient.invalidateQueries({ queryKey: ["/api/operator/security-events"] });
      setShowResolveDialog(false);
      setSelectedEvent(null);
      setResolution("");
    },
    onError: (error: Error) => {
      toast({ title: "Failed to resolve event", description: error.message, variant: "destructive" });
    },
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical": return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Critical</Badge>;
      case "high": return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">High</Badge>;
      case "medium": return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Medium</Badge>;
      case "low": return <Badge variant="secondary">Low</Badge>;
      case "info": return <Badge variant="outline">Info</Badge>;
      default: return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open": return <Badge className="bg-red-500/10 text-red-500 border-red-500/20"><Clock className="h-3 w-3 mr-1" />Open</Badge>;
      case "investigating": return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"><Eye className="h-3 w-3 mr-1" />Investigating</Badge>;
      case "resolved": return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle2 className="h-3 w-3 mr-1" />Resolved</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "critical": return <Badge variant="destructive">Critical</Badge>;
      case "high": return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">High</Badge>;
      case "medium": return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Medium</Badge>;
      case "low": return <Badge variant="secondary">Low</Badge>;
      default: return <Badge variant="outline">{risk}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Security Audit</h1>
          <p className="text-muted-foreground">
            Monitor security events, review audit logs, and manage compliance
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} data-testid="btn-create-event">
          <Plus className="h-4 w-4 mr-2" />
          Log Security Event
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-500" />
              Critical Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {eventsData?.events?.filter(e => e.severity === 'critical' && e.status === 'open').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              High Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {eventsData?.events?.filter(e => e.severity === 'high' && e.status === 'open').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              Open Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {eventsData?.events?.filter(e => e.status === 'open').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              Resolved Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {eventsData?.events?.filter(e => e.status === 'resolved').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setPage(1); }}>
        <TabsList>
          <TabsTrigger value="events" data-testid="tab-events">
            <Shield className="h-4 w-4 mr-2" />
            Security Events
          </TabsTrigger>
          <TabsTrigger value="audit" data-testid="tab-audit">
            <Activity className="h-4 w-4 mr-2" />
            Audit Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Security Events</CardTitle>
                <div className="flex gap-2">
                  <Select value={severityFilter} onValueChange={(v) => { setSeverityFilter(v); setPage(1); }}>
                    <SelectTrigger className="w-32" data-testid="select-severity">
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                    <SelectTrigger className="w-32" data-testid="select-event-status">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {eventsLoading ? (
                <Skeleton className="h-64" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Type</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Occurred</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventsData?.events?.map((event) => (
                      <TableRow key={event.id} data-testid={`row-event-${event.id}`}>
                        <TableCell>
                          <div>
                            <p className="font-medium capitalize">{event.event_type.replace(/_/g, " ")}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {event.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {event.target_type}
                          </Badge>
                        </TableCell>
                        <TableCell>{getSeverityBadge(event.severity)}</TableCell>
                        <TableCell>{getStatusBadge(event.status)}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(event.occurred_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setSelectedEvent(event)}
                              data-testid={`btn-view-event-${event.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {event.status !== "resolved" && (
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedEvent(event);
                                  setShowResolveDialog(true);
                                }}
                                data-testid={`btn-resolve-${event.id}`}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!eventsData?.events || eventsData.events.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No security events found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}

              {eventsData?.pagination && eventsData.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {eventsData.pagination.page} of {eventsData.pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === eventsData.pagination.totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Admin Audit Logs</CardTitle>
                <Select value={riskFilter} onValueChange={(v) => { setRiskFilter(v); setPage(1); }}>
                  <SelectTrigger className="w-32" data-testid="select-risk">
                    <SelectValue placeholder="Risk Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {auditLoading ? (
                <Skeleton className="h-64" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Risk</TableHead>
                      <TableHead>Operator</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditData?.logs?.map((log) => (
                      <TableRow key={log.id} data-testid={`row-audit-${log.id}`}>
                        <TableCell className="capitalize">
                          {log.action_type.replace(/_/g, " ")}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {log.action_category.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{log.resource}</span>
                          {log.resource_id && (
                            <span className="text-xs text-muted-foreground ml-1">
                              ({log.resource_id.slice(0, 8)}...)
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{getRiskBadge(log.risk_level)}</TableCell>
                        <TableCell className="text-sm">{log.operator_id}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(log.created_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!auditData?.logs || auditData.logs.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No audit logs found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}

              {auditData?.pagination && auditData.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {auditData.pagination.page} of {auditData.pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === auditData.pagination.totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Event Detail Dialog */}
      <Dialog open={!!selectedEvent && !showResolveDialog} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Security Event Details</DialogTitle>
            <DialogDescription className="capitalize">
              {selectedEvent?.event_type.replace(/_/g, " ")}
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Severity</p>
                  {getSeverityBadge(selectedEvent.severity)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(selectedEvent.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Target Type</p>
                  <Badge variant="outline" className="capitalize">{selectedEvent.target_type}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Source IP</p>
                  <p className="font-mono text-sm">{selectedEvent.source_ip || "Unknown"}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-sm bg-muted p-3 rounded-md">{selectedEvent.description}</p>
              </div>

              {selectedEvent.target_address && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Target Address</p>
                  <p className="font-mono text-sm">{selectedEvent.target_address}</p>
                </div>
              )}

              {selectedEvent.resolution && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md">
                  <p className="text-sm text-green-500 mb-1">Resolution</p>
                  <p className="text-sm">{selectedEvent.resolution}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Resolved by {selectedEvent.resolved_by} at {new Date(selectedEvent.resolved_at!).toLocaleString()}
                  </p>
                </div>
              )}

              <div className="flex gap-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Occurred:</span> {new Date(selectedEvent.occurred_at).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Detected:</span> {new Date(selectedEvent.detected_at).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {selectedEvent && selectedEvent.status !== "resolved" && (
              <Button onClick={() => setShowResolveDialog(true)} data-testid="btn-resolve-event">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Resolve Event
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Security Event</DialogTitle>
            <DialogDescription>
              Provide details about how this event was resolved
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Resolution Details</label>
              <Textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Describe the resolution..."
                className="mt-1"
                rows={4}
                data-testid="input-resolution"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolveDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedEvent) {
                  resolveMutation.mutate({ id: selectedEvent.id, resolution });
                }
              }}
              disabled={resolveMutation.isPending || !resolution}
              data-testid="btn-confirm-resolve"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Resolve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Event Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Security Event</DialogTitle>
            <DialogDescription>
              Manually log a security event for tracking
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Event Type</label>
              <Input
                value={newEvent.eventType}
                onChange={(e) => setNewEvent({ ...newEvent, eventType: e.target.value })}
                placeholder="e.g., unauthorized_access, suspicious_activity"
                className="mt-1"
                data-testid="input-event-type"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Severity</label>
                <Select
                  value={newEvent.severity}
                  onValueChange={(v) => setNewEvent({ ...newEvent, severity: v })}
                >
                  <SelectTrigger className="mt-1" data-testid="select-new-severity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Target Type</label>
                <Select
                  value={newEvent.targetType}
                  onValueChange={(v) => setNewEvent({ ...newEvent, targetType: v })}
                >
                  <SelectTrigger className="mt-1" data-testid="select-target-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="validator">Validator</SelectItem>
                    <SelectItem value="transaction">Transaction</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Target Address (optional)</label>
              <Input
                value={newEvent.targetAddress}
                onChange={(e) => setNewEvent({ ...newEvent, targetAddress: e.target.value })}
                placeholder="0x..."
                className="mt-1 font-mono"
                data-testid="input-target-address"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Detailed description of the security event..."
                className="mt-1"
                rows={3}
                data-testid="input-event-description"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createEventMutation.mutate(newEvent)}
              disabled={createEventMutation.isPending || !newEvent.eventType || !newEvent.description}
              data-testid="btn-create-security-event"
            >
              <FileWarning className="h-4 w-4 mr-2" />
              Log Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
