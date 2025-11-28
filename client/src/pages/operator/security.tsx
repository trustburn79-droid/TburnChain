import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Activity, FileWarning, Ban, Globe, MapPin, Zap, Radio,
  TrendingUp, BarChart3, Trash2
} from "lucide-react";
import { useAdminPassword } from "@/hooks/use-admin-password";
import { queryClient } from "@/lib/queryClient";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

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

interface IPBlockEntry {
  id: string;
  ip_address: string;
  reason: string;
  blocked_by: string;
  blocked_at: string;
  expires_at: string | null;
  is_active: boolean;
}

interface ThreatFeedItem {
  id: string;
  timestamp: Date;
  type: string;
  severity: string;
  source_ip: string;
  description: string;
  country?: string;
}

const CHART_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

const SEVERITY_KEYS: Record<string, string> = {
  critical: "operator.security.critical",
  high: "operator.security.high",
  medium: "operator.security.medium",
  low: "operator.security.low",
  info: "operator.security.info",
};

const THREAT_TYPE_KEYS: Record<string, string> = {
  login_attempt: "operator.security.threatTypes.loginAttempt",
  suspicious_tx: "operator.security.threatTypes.suspiciousTx",
  rate_limit: "operator.security.threatTypes.rateLimit",
  api_abuse: "operator.security.threatTypes.apiAbuse",
  brute_force: "operator.security.threatTypes.bruteForce",
  unauthorized_access: "operator.security.threatTypes.unauthorizedAccess",
  ddos: "operator.security.threatTypes.ddos",
  sql_injection: "operator.security.threatTypes.sqlInjection",
  xss: "operator.security.threatTypes.xss",
  replay_attack: "operator.security.threatTypes.replayAttack",
};

const RISK_LEVEL_KEYS: Record<string, string> = {
  critical: "operator.security.critical",
  high: "operator.security.high",
  medium: "operator.security.medium",
  low: "operator.security.low",
};

const AUDIT_ACTION_TYPE_KEYS: Record<string, string> = {
  config_change: "operator.security.auditActions.configChange",
  member_add: "operator.security.auditActions.memberAdd",
  member_remove: "operator.security.auditActions.memberRemove",
  member_update: "operator.security.auditActions.memberUpdate",
  validator_slash: "operator.security.auditActions.validatorSlash",
  validator_approve: "operator.security.auditActions.validatorApprove",
  validator_reject: "operator.security.auditActions.validatorReject",
  security_event: "operator.security.auditActions.securityEvent",
  ip_block: "operator.security.auditActions.ipBlock",
  ip_unblock: "operator.security.auditActions.ipUnblock",
  permission_change: "operator.security.auditActions.permissionChange",
  login: "operator.security.auditActions.login",
  logout: "operator.security.auditActions.logout",
};

const AUDIT_CATEGORY_KEYS: Record<string, string> = {
  security: "operator.security.auditCategories.security",
  validators: "operator.security.auditCategories.validators",
  members: "operator.security.auditCategories.members",
  config: "operator.security.auditCategories.config",
  access: "operator.security.auditCategories.access",
  network: "operator.security.auditCategories.network",
};

const RESOURCE_TYPE_KEYS: Record<string, string> = {
  members: "operator.security.resourceTypes.members",
  validators: "operator.security.resourceTypes.validators",
  config: "operator.security.resourceTypes.config",
  security: "operator.security.resourceTypes.security",
  network: "operator.security.resourceTypes.network",
  contracts: "operator.security.resourceTypes.contracts",
  transactions: "operator.security.resourceTypes.transactions",
  system: "operator.security.resourceTypes.system",
};

const OPERATOR_KEYS: Record<string, string> = {
  admin: "operator.security.operators.admin",
  system: "operator.security.operators.system",
  api: "operator.security.operators.api",
};

const MOCK_GEO_DATA = [
  { country: 'US', count: 45, risk: 'medium' },
  { country: 'CN', count: 32, risk: 'high' },
  { country: 'RU', count: 28, risk: 'high' },
  { country: 'DE', count: 18, risk: 'low' },
  { country: 'UK', count: 15, risk: 'low' },
  { country: 'IN', count: 12, risk: 'medium' },
  { country: 'BR', count: 8, risk: 'medium' },
  { country: 'Other', count: 22, risk: 'low' },
];

export default function OperatorSecurity() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { getAuthHeaders } = useAdminPassword();
  const [activeTab, setActiveTab] = useState("events");
  const [eventsPage, setEventsPage] = useState(1);
  const [auditPage, setAuditPage] = useState(1);
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

  const [showBlockIPDialog, setShowBlockIPDialog] = useState(false);
  const [newBlockedIP, setNewBlockedIP] = useState({ ip: "", reason: "", duration: "permanent" });
  const [threatFeed, setThreatFeed] = useState<ThreatFeedItem[]>([]);

  useEffect(() => {
    const generateThreatItem = (): ThreatFeedItem => {
      const types = ['login_attempt', 'suspicious_tx', 'rate_limit', 'api_abuse', 'brute_force'];
      const severities = ['critical', 'high', 'medium', 'low'];
      const countries = ['US', 'CN', 'RU', 'DE', 'UK', 'IN', 'BR', 'KR', 'JP', 'AU'];
      const descriptions = [
        'Multiple failed authentication attempts',
        'Suspicious transaction pattern detected',
        'Rate limit exceeded from IP range',
        'API endpoint abuse detected',
        'Brute force attack on validator endpoint',
        'Unusual wallet activity pattern',
        'Potential replay attack attempt',
        'Invalid signature verification failure',
      ];
      return {
        id: `threat-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        timestamp: new Date(),
        type: types[Math.floor(Math.random() * types.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        source_ip: `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        country: countries[Math.floor(Math.random() * countries.length)],
      };
    };

    if (activeTab === 'threats') {
      const initialFeed = Array.from({ length: 10 }, generateThreatItem);
      setThreatFeed(initialFeed);

      const interval = setInterval(() => {
        setThreatFeed((prev) => [generateThreatItem(), ...prev.slice(0, 49)]);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const buildEventsQuery = () => {
    const params = new URLSearchParams();
    params.set("page", eventsPage.toString());
    params.set("limit", "20");
    if (severityFilter !== "all") params.set("severity", severityFilter);
    if (statusFilter !== "all") params.set("status", statusFilter);
    return params.toString();
  };

  const buildAuditQuery = () => {
    const params = new URLSearchParams();
    params.set("page", auditPage.toString());
    params.set("limit", "50");
    if (riskFilter !== "all") params.set("riskLevel", riskFilter);
    return params.toString();
  };

  const { data: eventsData, isLoading: eventsLoading } = useQuery<SecurityEventsResponse>({
    queryKey: ["/api/operator/security-events", eventsPage, severityFilter, statusFilter],
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
    queryKey: ["/api/operator/audit-logs", auditPage, riskFilter],
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
      toast({ title: t('operator.security.eventCreated') });
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
      toast({ title: t('operator.security.failedCreateEvent'), description: error.message, variant: "destructive" });
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
      toast({ title: t('operator.security.eventResolved') });
      queryClient.invalidateQueries({ queryKey: ["/api/operator/security-events"] });
      setShowResolveDialog(false);
      setSelectedEvent(null);
      setResolution("");
    },
    onError: (error: Error) => {
      toast({ title: t('operator.security.failedResolveEvent'), description: error.message, variant: "destructive" });
    },
  });

  const { data: ipBlocklist } = useQuery<IPBlockEntry[]>({
    queryKey: ["/api/operator/ip-blocklist"],
    queryFn: async () => {
      const response = await fetch("/api/operator/ip-blocklist", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: activeTab === "blocklist",
  });

  const blockIPMutation = useMutation({
    mutationFn: async (data: { ipAddress: string; reason: string; duration: string }) => {
      const response = await fetch("/api/operator/ip-blocklist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to block IP");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: t('operator.security.ipBlocked') });
      queryClient.invalidateQueries({ queryKey: ["/api/operator/ip-blocklist"] });
      setShowBlockIPDialog(false);
      setNewBlockedIP({ ip: "", reason: "", duration: "permanent" });
    },
    onError: (error: Error) => {
      toast({ title: t('operator.security.failedBlockIp'), description: error.message, variant: "destructive" });
    },
  });

  const unblockIPMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/operator/ip-blocklist/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to unblock IP");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: t('operator.security.ipUnblocked') });
      queryClient.invalidateQueries({ queryKey: ["/api/operator/ip-blocklist"] });
    },
    onError: (error: Error) => {
      toast({ title: t('operator.security.failedUnblockIp'), description: error.message, variant: "destructive" });
    },
  });

  const threatChartData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 24 }, (_, i) => {
      const hour = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
      return {
        time: hour.toLocaleTimeString([], { hour: '2-digit' }),
        critical: Math.floor(Math.random() * 5),
        high: Math.floor(Math.random() * 15),
        medium: Math.floor(Math.random() * 30),
        low: Math.floor(Math.random() * 20),
      };
    });
  }, [activeTab]);

  const severityDistribution = useMemo(() => [
    { name: 'Critical', value: eventsData?.events?.filter(e => e.severity === 'critical').length || 3, fill: '#ef4444' },
    { name: 'High', value: eventsData?.events?.filter(e => e.severity === 'high').length || 8, fill: '#f97316' },
    { name: 'Medium', value: eventsData?.events?.filter(e => e.severity === 'medium').length || 15, fill: '#eab308' },
    { name: 'Low', value: eventsData?.events?.filter(e => e.severity === 'low').length || 12, fill: '#22c55e' },
  ], [eventsData]);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical": return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />{t('operator.security.critical')}</Badge>;
      case "high": return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">{t('operator.security.high')}</Badge>;
      case "medium": return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">{t('operator.security.medium')}</Badge>;
      case "low": return <Badge variant="secondary">{t('operator.security.low')}</Badge>;
      case "info": return <Badge variant="outline">{t('operator.security.info')}</Badge>;
      default: return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open": return <Badge className="bg-red-500/10 text-red-500 border-red-500/20"><Clock className="h-3 w-3 mr-1" />{t('operator.security.open')}</Badge>;
      case "investigating": return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"><Eye className="h-3 w-3 mr-1" />{t('operator.security.investigating')}</Badge>;
      case "resolved": return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle2 className="h-3 w-3 mr-1" />{t('operator.security.resolved')}</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "critical": return <Badge variant="destructive">{t('operator.security.critical')}</Badge>;
      case "high": return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">{t('operator.security.high')}</Badge>;
      case "medium": return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">{t('operator.security.medium')}</Badge>;
      case "low": return <Badge variant="secondary">{t('operator.security.low')}</Badge>;
      default: return <Badge variant="outline">{risk}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('operator.security.title')}</h1>
          <p className="text-muted-foreground">
            {t('operator.security.subtitle')}
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} data-testid="btn-create-event">
          <Plus className="h-4 w-4 mr-2" />
          {t('operator.security.logSecurityEvent')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-500" />
              {t('operator.security.criticalEvents')}
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
              {t('operator.security.highPriority')}
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
              {t('operator.security.openEvents')}
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
              {t('operator.security.resolvedToday')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {eventsData?.events?.filter(e => e.status === 'resolved').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="tabs-security">
        <TabsList className="grid w-full grid-cols-4" data-testid="tablist-security">
          <TabsTrigger value="events" data-testid="tab-events">
            <Shield className="h-4 w-4 mr-2" />
            {t('operator.security.events')}
          </TabsTrigger>
          <TabsTrigger value="threats" data-testid="tab-threats">
            <Radio className="h-4 w-4 mr-2" />
            {t('operator.security.threatMonitor')}
          </TabsTrigger>
          <TabsTrigger value="blocklist" data-testid="tab-blocklist">
            <Ban className="h-4 w-4 mr-2" />
            {t('operator.security.ipBlocklist')}
          </TabsTrigger>
          <TabsTrigger value="audit" data-testid="tab-audit">
            <Activity className="h-4 w-4 mr-2" />
            {t('operator.security.auditLogs')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t('operator.security.securityEvents')}</CardTitle>
                <div className="flex gap-2">
                  <Select value={severityFilter} onValueChange={(v) => { setSeverityFilter(v); setEventsPage(1); }}>
                    <SelectTrigger className="w-32" data-testid="select-severity">
                      <SelectValue placeholder={t('operator.security.severity')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all')}</SelectItem>
                      <SelectItem value="critical">{t('operator.security.critical')}</SelectItem>
                      <SelectItem value="high">{t('operator.security.high')}</SelectItem>
                      <SelectItem value="medium">{t('operator.security.medium')}</SelectItem>
                      <SelectItem value="low">{t('operator.security.low')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setEventsPage(1); }}>
                    <SelectTrigger className="w-32" data-testid="select-event-status">
                      <SelectValue placeholder={t('common.status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all')}</SelectItem>
                      <SelectItem value="open">{t('operator.security.open')}</SelectItem>
                      <SelectItem value="investigating">{t('operator.security.investigating')}</SelectItem>
                      <SelectItem value="resolved">{t('operator.security.resolved')}</SelectItem>
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
                      <TableHead>{t('operator.security.eventType')}</TableHead>
                      <TableHead>{t('operator.security.target')}</TableHead>
                      <TableHead>{t('operator.security.severity')}</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                      <TableHead>{t('operator.security.occurred')}</TableHead>
                      <TableHead>{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventsData?.events?.map((event) => (
                      <TableRow key={event.id} data-testid={`row-event-${event.id}`}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{t(`operator.security.eventTypes.${event.event_type}`, { defaultValue: event.event_type.replace(/_/g, " ") })}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {event.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {t(`operator.security.targetTypes.${event.target_type}`, { defaultValue: event.target_type })}
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
                          {t('operator.security.noEventsFound')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}

              {eventsData?.pagination && eventsData.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    {t('common.pageOf', { page: eventsPage, totalPages: eventsData.pagination.totalPages })}
                    {eventsLoading && <span className="ml-2 text-xs">({t('common.loading')}...)</span>}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEventsPage(Math.max(1, eventsPage - 1))}
                      disabled={eventsPage <= 1 || eventsLoading}
                      data-testid="btn-events-prev"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEventsPage(Math.min(eventsData.pagination.totalPages, eventsPage + 1))}
                      disabled={eventsPage >= eventsData.pagination.totalPages || eventsLoading}
                      data-testid="btn-events-next"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2" data-testid="card-threat-chart">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {t('operator.security.threatActivity24h')}
                </CardTitle>
                <CardDescription>{t('operator.security.eventsBySeverity')}</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={threatChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="time" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Area type="monotone" dataKey="critical" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="high" stackId="1" stroke="#f97316" fill="#f97316" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="medium" stackId="1" stroke="#eab308" fill="#eab308" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="low" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card data-testid="card-severity-dist">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {t('operator.security.severityDistribution')}
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {severityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {severityDistribution.map((item) => (
                    <div key={item.name} className="flex items-center gap-1 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                      {item.name}: {item.value}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card data-testid="card-live-feed">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500 animate-pulse" />
                  {t('operator.security.liveThreatFeed')}
                </CardTitle>
                <CardDescription>{t('operator.security.realTimeEvents')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[350px]">
                  <div className="space-y-2">
                    {threatFeed.map((threat) => (
                      <div 
                        key={threat.id} 
                        className="p-3 bg-muted/50 rounded-lg border-l-4"
                        style={{ 
                          borderLeftColor: threat.severity === 'critical' ? '#ef4444' : 
                                          threat.severity === 'high' ? '#f97316' : 
                                          threat.severity === 'medium' ? '#eab308' : '#22c55e'
                        }}
                        data-testid={`threat-item-${threat.id}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant={threat.severity === 'critical' ? 'destructive' : 'outline'} className="capitalize">
                            {t(SEVERITY_KEYS[threat.severity] || `operator.security.${threat.severity}`)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {threat.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm">{threat.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="font-mono">{threat.source_ip}</span>
                          {threat.country && (
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {threat.country}
                            </span>
                          )}
                          <Badge variant="outline" className="capitalize text-xs">{t(THREAT_TYPE_KEYS[threat.type] || `operator.security.threatTypes.${threat.type}`)}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card data-testid="card-geo-analysis">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {t('operator.security.geographicAnalysis')}
                </CardTitle>
                <CardDescription>{t('operator.security.threatSourcesByCountry')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('operator.security.country')}</TableHead>
                      <TableHead>{t('operator.security.events')}</TableHead>
                      <TableHead>{t('operator.security.riskLevel')}</TableHead>
                      <TableHead>{t('operator.security.percentOfTotal')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_GEO_DATA.map((geo) => (
                      <TableRow key={geo.country} data-testid={`row-geo-${geo.country}`}>
                        <TableCell className="font-medium">{geo.country}</TableCell>
                        <TableCell>{geo.count}</TableCell>
                        <TableCell>
                          <Badge variant={geo.risk === 'high' ? 'destructive' : geo.risk === 'medium' ? 'secondary' : 'outline'}>
                            {t(RISK_LEVEL_KEYS[geo.risk] || `operator.security.${geo.risk}`)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={(geo.count / 180) * 100} className="w-16 h-2" />
                            <span className="text-xs">{((geo.count / 180) * 100).toFixed(0)}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="blocklist" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{t('operator.security.ipBlocklistManagement')}</h3>
              <p className="text-sm text-muted-foreground">{t('operator.security.manageBlockedIPs')}</p>
            </div>
            <Button onClick={() => setShowBlockIPDialog(true)} data-testid="btn-block-ip">
              <Ban className="h-4 w-4 mr-2" />
              {t('operator.security.blockIpAddress')}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card data-testid="card-total-blocked">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t('operator.security.totalBlockedIPs')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{ipBlocklist?.length || 0}</div>
              </CardContent>
            </Card>
            <Card data-testid="card-active-blocks">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t('operator.security.activeBlocks')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ipBlocklist?.filter(ip => ip.is_active).length || 0}</div>
              </CardContent>
            </Card>
            <Card data-testid="card-permanent-blocks">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t('operator.security.permanentBlocks')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ipBlocklist?.filter(ip => !ip.expires_at).length || 0}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('operator.security.blockedIpAddresses')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('operator.security.ipAddress')}</TableHead>
                    <TableHead>{t('operator.security.reason')}</TableHead>
                    <TableHead>{t('operator.security.blockedBy')}</TableHead>
                    <TableHead>{t('operator.security.blockedAt')}</TableHead>
                    <TableHead>{t('operator.security.expires')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead>{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ipBlocklist?.map((entry) => (
                    <TableRow key={entry.id} data-testid={`row-ip-${entry.id}`}>
                      <TableCell className="font-mono">{entry.ip_address}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{entry.reason}</TableCell>
                      <TableCell>{entry.blocked_by}</TableCell>
                      <TableCell className="text-sm">{new Date(entry.blocked_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-sm">
                        {entry.expires_at ? new Date(entry.expires_at).toLocaleDateString() : t('operator.security.never')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={entry.is_active ? 'destructive' : 'secondary'}>
                          {entry.is_active ? t('operator.members.active') : t('operator.security.expired')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => unblockIPMutation.mutate(entry.id)}
                          disabled={unblockIPMutation.isPending}
                          data-testid={`btn-unblock-${entry.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!ipBlocklist || ipBlocklist.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        {t('operator.security.noBlockedIPsFound')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle>{t('operator.security.adminAuditLogs')}</CardTitle>
                <Select value={riskFilter} onValueChange={(v) => { setRiskFilter(v); setAuditPage(1); }}>
                  <SelectTrigger className="w-32" data-testid="select-risk">
                    <SelectValue placeholder={t('operator.security.riskLevel')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    <SelectItem value="critical">{t('operator.security.critical')}</SelectItem>
                    <SelectItem value="high">{t('operator.security.high')}</SelectItem>
                    <SelectItem value="medium">{t('operator.security.medium')}</SelectItem>
                    <SelectItem value="low">{t('operator.security.low')}</SelectItem>
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
                      <TableHead>{t('operator.security.action')}</TableHead>
                      <TableHead>{t('operator.security.category')}</TableHead>
                      <TableHead>{t('operator.security.resource')}</TableHead>
                      <TableHead>{t('operator.security.risk')}</TableHead>
                      <TableHead>{t('operator.security.operator')}</TableHead>
                      <TableHead>{t('operator.security.timestamp')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditData?.logs?.map((log) => (
                      <TableRow key={log.id} data-testid={`row-audit-${log.id}`}>
                        <TableCell className="capitalize">
                          {t(AUDIT_ACTION_TYPE_KEYS[log.action_type] || `operator.security.auditActions.${log.action_type}`)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {t(AUDIT_CATEGORY_KEYS[log.action_category] || `operator.security.auditCategories.${log.action_category}`)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {t(RESOURCE_TYPE_KEYS[log.resource] || `operator.security.resourceTypes.${log.resource}`, { defaultValue: log.resource })}
                          </span>
                          {log.resource_id && (
                            <span className="text-xs text-muted-foreground ml-1">
                              ({log.resource_id.slice(0, 8)}...)
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{getRiskBadge(log.risk_level)}</TableCell>
                        <TableCell className="text-sm">
                          {t(OPERATOR_KEYS[log.operator_id] || `operator.security.operators.${log.operator_id}`, { defaultValue: log.operator_id })}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(log.created_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!auditData?.logs || auditData.logs.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          {t('operator.security.noAuditLogsFound')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}

              {auditData?.pagination && auditData.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    {t('common.page')} {auditPage} {t('common.of')} {auditData.pagination.totalPages}
                    {auditLoading && <span className="ml-2 text-xs">({t('common.loading')})</span>}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAuditPage(Math.max(1, auditPage - 1))}
                      disabled={auditPage <= 1 || auditLoading}
                      data-testid="btn-audit-prev"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAuditPage(Math.min(auditData.pagination.totalPages, auditPage + 1))}
                      disabled={auditPage >= auditData.pagination.totalPages || auditLoading}
                      data-testid="btn-audit-next"
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
            <DialogTitle>{t('operator.security.securityEventDetails')}</DialogTitle>
            <DialogDescription>
              {selectedEvent && t(`operator.security.eventTypes.${selectedEvent.event_type}`, { defaultValue: selectedEvent.event_type.replace(/_/g, " ") })}
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t('operator.security.severity')}</p>
                  {getSeverityBadge(selectedEvent.severity)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('common.status')}</p>
                  {getStatusBadge(selectedEvent.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('operator.security.targetType')}</p>
                  <Badge variant="outline">{t(`operator.security.targetTypes.${selectedEvent.target_type}`, { defaultValue: selectedEvent.target_type })}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('operator.security.sourceIp')}</p>
                  <p className="font-mono text-sm">{selectedEvent.source_ip || t('operator.validators.unknown')}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">{t('common.description')}</p>
                <p className="text-sm bg-muted p-3 rounded-md">{selectedEvent.description}</p>
              </div>

              {selectedEvent.target_address && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t('operator.security.targetAddress')}</p>
                  <p className="font-mono text-sm">{selectedEvent.target_address}</p>
                </div>
              )}

              {selectedEvent.resolution && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md">
                  <p className="text-sm text-green-500 mb-1">{t('operator.security.resolution')}</p>
                  <p className="text-sm">{selectedEvent.resolution}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('operator.security.resolvedBy')} {selectedEvent.resolved_by} {t('operator.security.at')} {new Date(selectedEvent.resolved_at!).toLocaleString()}
                  </p>
                </div>
              )}

              <div className="flex gap-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">{t('operator.security.occurred')}:</span> {new Date(selectedEvent.occurred_at).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">{t('operator.security.detected')}:</span> {new Date(selectedEvent.detected_at).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {selectedEvent && selectedEvent.status !== "resolved" && (
              <Button onClick={() => setShowResolveDialog(true)} data-testid="btn-resolve-event">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {t('operator.security.resolveEvent')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('operator.security.resolveSecurityEvent')}</DialogTitle>
            <DialogDescription>
              {t('operator.security.resolveEventDesc')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t('operator.security.resolutionDetails')}</label>
              <Textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder={t('operator.security.describeResolution')}
                className="mt-1"
                rows={4}
                data-testid="input-resolution"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolveDialog(false)}>
              {t('common.cancel')}
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
              {t('operator.security.resolve')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Event Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('operator.security.logSecurityEvent')}</DialogTitle>
            <DialogDescription>
              {t('operator.security.logSecurityEventDesc')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t('operator.security.eventType')}</label>
              <Input
                value={newEvent.eventType}
                onChange={(e) => setNewEvent({ ...newEvent, eventType: e.target.value })}
                placeholder={t('operator.security.eventTypePlaceholder')}
                className="mt-1"
                data-testid="input-event-type"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{t('operator.security.severity')}</label>
                <Select
                  value={newEvent.severity}
                  onValueChange={(v) => setNewEvent({ ...newEvent, severity: v })}
                >
                  <SelectTrigger className="mt-1" data-testid="select-new-severity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">{t('operator.security.critical')}</SelectItem>
                    <SelectItem value="high">{t('operator.security.high')}</SelectItem>
                    <SelectItem value="medium">{t('operator.security.medium')}</SelectItem>
                    <SelectItem value="low">{t('operator.security.low')}</SelectItem>
                    <SelectItem value="info">{t('operator.security.info')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">{t('operator.security.targetType')}</label>
                <Select
                  value={newEvent.targetType}
                  onValueChange={(v) => setNewEvent({ ...newEvent, targetType: v })}
                >
                  <SelectTrigger className="mt-1" data-testid="select-target-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">{t('operator.security.member')}</SelectItem>
                    <SelectItem value="validator">{t('operator.security.validator')}</SelectItem>
                    <SelectItem value="transaction">{t('operator.security.transaction')}</SelectItem>
                    <SelectItem value="contract">{t('operator.security.contract')}</SelectItem>
                    <SelectItem value="system">{t('operator.security.system')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">{t('operator.security.targetAddressOptional')}</label>
              <Input
                value={newEvent.targetAddress}
                onChange={(e) => setNewEvent({ ...newEvent, targetAddress: e.target.value })}
                placeholder="0x..."
                className="mt-1 font-mono"
                data-testid="input-target-address"
              />
            </div>

            <div>
              <label className="text-sm font-medium">{t('common.description')}</label>
              <Textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder={t('operator.security.eventDescriptionPlaceholder')}
                className="mt-1"
                rows={3}
                data-testid="input-event-description"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={() => createEventMutation.mutate(newEvent)}
              disabled={createEventMutation.isPending || !newEvent.eventType || !newEvent.description}
              data-testid="btn-create-security-event"
            >
              <FileWarning className="h-4 w-4 mr-2" />
              {t('operator.security.logEvent')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block IP Dialog */}
      <Dialog open={showBlockIPDialog} onOpenChange={setShowBlockIPDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('operator.security.blockIpAddress')}</DialogTitle>
            <DialogDescription>
              {t('operator.security.blockIpDesc')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t('operator.security.ipAddress')}</label>
              <Input
                value={newBlockedIP.ip}
                onChange={(e) => setNewBlockedIP({ ...newBlockedIP, ip: e.target.value })}
                placeholder="192.168.1.1 or 10.0.0.0/24"
                className="mt-1 font-mono"
                data-testid="input-block-ip"
              />
            </div>

            <div>
              <label className="text-sm font-medium">{t('operator.security.reason')}</label>
              <Textarea
                value={newBlockedIP.reason}
                onChange={(e) => setNewBlockedIP({ ...newBlockedIP, reason: e.target.value })}
                placeholder={t('operator.security.reasonPlaceholder')}
                className="mt-1"
                rows={2}
                data-testid="input-block-reason"
              />
            </div>

            <div>
              <label className="text-sm font-medium">{t('operator.security.duration')}</label>
              <Select
                value={newBlockedIP.duration}
                onValueChange={(v) => setNewBlockedIP({ ...newBlockedIP, duration: v })}
              >
                <SelectTrigger className="mt-1" data-testid="select-block-duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">{t('operator.security.oneHour')}</SelectItem>
                  <SelectItem value="24h">{t('operator.security.twentyFourHours')}</SelectItem>
                  <SelectItem value="7d">{t('operator.security.sevenDays')}</SelectItem>
                  <SelectItem value="30d">{t('operator.security.thirtyDays')}</SelectItem>
                  <SelectItem value="permanent">{t('operator.security.permanent')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlockIPDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={() => blockIPMutation.mutate({
                ipAddress: newBlockedIP.ip,
                reason: newBlockedIP.reason,
                duration: newBlockedIP.duration,
              })}
              disabled={blockIPMutation.isPending || !newBlockedIP.ip || !newBlockedIP.reason}
              data-testid="btn-confirm-block-ip"
            >
              <Ban className="h-4 w-4 mr-2" />
              {t('operator.security.blockIp')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
