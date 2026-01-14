import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Lock,
  AlertTriangle,
  Clock,
  RefreshCw,
  Wifi,
  WifiOff,
  Eye,
  XCircle,
  Plus,
  Trash2,
  Activity,
  FileText,
  Network,
  Ban,
  CheckCircle,
  TrendingUp,
  Gauge,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SecurityAlert {
  id: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  validatorAddress: string;
  message: string;
  timestamp: number;
  details: Record<string, unknown>;
}

interface RateLimitStats {
  validatorAddress: string;
  requests: number;
  violations: number;
  blocked: boolean;
  blockedUntil?: number;
}

interface IPWhitelistEntry {
  ip: string;
  addedAt: number;
  addedBy: string;
  description: string;
}

interface AuditLogEntry {
  id: string;
  timestamp: number;
  level: "INFO" | "WARN" | "ERROR" | "SECURITY";
  category: string;
  action: string;
  validatorAddress?: string;
  details: Record<string, unknown>;
}

interface ValidatorSecurityData {
  overview: {
    totalValidators: number;
    activeValidators: number;
    blockedValidators: number;
    totalAlerts24h: number;
    criticalAlerts: number;
    avgLatencyMs: number;
    successRate: number;
  };
  alerts: SecurityAlert[];
  rateLimits: RateLimitStats[];
  ipWhitelist: IPWhitelistEntry[];
  auditLogs: AuditLogEntry[];
}

export default function AdminValidatorSecurity() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [wsConnected, setWsConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [newIP, setNewIP] = useState("");
  const [newIPDescription, setNewIPDescription] = useState("");
  const [showAddIPDialog, setShowAddIPDialog] = useState(false);

  const { data: overviewData, isLoading: overviewLoading, error: overviewError } = useQuery<{ success: boolean; data: any }>({
    queryKey: ["/api/external-validators/security/overview"],
    refetchInterval: 30000,
    retry: false,
  });
  
  const { data: alertsData } = useQuery<{ success: boolean; data: any[] }>({
    queryKey: ["/api/external-validators/security/alerts"],
    refetchInterval: 30000,
  });
  
  const { data: rateLimitsData } = useQuery<{ success: boolean; data: any }>({
    queryKey: ["/api/external-validators/security/rate-limits"],
    refetchInterval: 30000,
  });
  
  const { data: ipWhitelistData, refetch: refetchIPWhitelist } = useQuery<{ success: boolean; data: any[] }>({
    queryKey: ["/api/external-validators/security/ip-whitelist"],
    refetchInterval: 30000,
  });
  
  const { data: auditLogsData, refetch: refetchAuditLogs } = useQuery<{ success: boolean; data: any[] }>({
    queryKey: ["/api/external-validators/security/audit-logs"],
    refetchInterval: 30000,
  });
  
  const isLoading = overviewLoading;
  
  const securityOverview = overviewData?.data ?? {};
  const overview = {
    totalValidators: securityOverview.totalValidators ?? 0,
    activeValidators: securityOverview.activeValidators ?? 0,
    blockedValidators: securityOverview.rateLimiting?.currentlyBlocked ?? 0,
    totalAlerts24h: securityOverview.anomalyDetection?.totalAlerts24h ?? 0,
    criticalAlerts: securityOverview.anomalyDetection?.activeAlerts ?? 0,
    avgLatencyMs: 45,
    successRate: securityOverview.securityScore ?? 95,
  };

  const alerts = (alertsData?.data ?? []).map((a: any) => ({
    id: a.id,
    type: a.type,
    severity: a.severity,
    validatorAddress: a.validatorAddress,
    message: a.description,
    timestamp: new Date(a.timestamp).getTime(),
    details: {},
    status: a.status,
  }));
  
  const rateLimitsInfo = rateLimitsData?.data ?? { limits: {}, blockedAddresses: [] };
  const rateLimits = (rateLimitsInfo.blockedAddresses ?? []).map((b: any) => ({
    validatorAddress: b.address,
    requests: 0,
    violations: 1,
    blocked: true,
    blockedUntil: new Date(b.blockedAt).getTime() + 3600000,
    reason: b.reason,
    tier: b.tier,
  }));
  
  const ipWhitelist = (ipWhitelistData?.data ?? []).map((entry: any) => ({
    ip: entry.ip,
    addedAt: new Date(entry.addedAt).getTime(),
    addedBy: entry.addedBy,
    description: entry.description,
  }));
  
  const auditLogs = (auditLogsData?.data ?? []).map((log: any) => ({
    id: log.id,
    timestamp: new Date(log.timestamp).getTime(),
    level: log.severity === 'critical' ? 'ERROR' : log.severity === 'warning' ? 'WARN' : 'INFO',
    category: 'SECURITY',
    action: log.action,
    validatorAddress: log.validatorAddress,
    details: { message: log.details },
    verified: log.verified,
  }));

  const addIPMutation = useMutation({
    mutationFn: async ({ ip, description }: { ip: string; description: string }) => {
      return apiRequest("POST", "/api/external-validators/security/ip-whitelist", { ip, description });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/external-validators/security/ip-whitelist"] });
      setShowAddIPDialog(false);
      setNewIP("");
      setNewIPDescription("");
      toast({
        title: "IP Added",
        description: "IP address has been added to the whitelist.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add IP to whitelist.",
        variant: "destructive",
      });
    },
  });

  const removeIPMutation = useMutation({
    mutationFn: async (ip: string) => {
      return apiRequest("DELETE", `/api/external-validators/security/ip-whitelist/${encodeURIComponent(ip)}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/external-validators/security/ip-whitelist"] });
      toast({
        title: "IP Removed",
        description: "IP address has been removed from the whitelist.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove IP from whitelist.",
        variant: "destructive",
      });
    },
  });

  const unblockValidatorMutation = useMutation({
    mutationFn: async (validatorAddress: string) => {
      return apiRequest("POST", `/api/external-validators/security/rate-limits/unblock/${validatorAddress}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/external-validators/security/rate-limits"] });
      toast({
        title: "Validator Unblocked",
        description: "Validator has been unblocked.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to unblock validator.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    let ws: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          setWsConnected(true);
          ws?.send(JSON.stringify({ type: "subscribe", channel: "validator_security" }));
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === "validator_security_update" || message.type === "security_alert") {
              queryClient.invalidateQueries({ queryKey: ["/api/external-validators/security/overview"] });
              queryClient.invalidateQueries({ queryKey: ["/api/external-validators/security/alerts"] });
              setLastUpdate(new Date());
            }
          } catch {
          }
        };

        ws.onclose = () => {
          setWsConnected(false);
          reconnectTimeout = setTimeout(connect, 5000);
        };

        ws.onerror = () => {
          setWsConnected(false);
        };
      } catch {
        setWsConnected(false);
        reconnectTimeout = setTimeout(connect, 5000);
      }
    };

    connect();

    return () => {
      if (ws) {
        ws.close();
      }
      clearTimeout(reconnectTimeout);
    };
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["/api/external-validators/security/overview"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/external-validators/security/alerts"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/external-validators/security/rate-limits"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/external-validators/security/ip-whitelist"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/external-validators/security/audit-logs"] }),
    ]);
    setLastUpdate(new Date());
    setIsRefreshing(false);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "ERROR":
        return "destructive";
      case "SECURITY":
        return "destructive";
      case "WARN":
        return "secondary";
      case "INFO":
        return "outline";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (overviewError) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2" data-testid="text-error-title">Authentication Required</h2>
          <p className="text-muted-foreground mb-4" data-testid="text-error-message">
            You must be logged in as an admin to access validator security management.
          </p>
          <p className="text-sm text-muted-foreground">
            Please ensure you are logged into the admin portal with proper credentials.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
            External Validator Security
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage security for external validator nodes
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={wsConnected ? "default" : "secondary"} className="gap-1">
            {wsConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {wsConnected ? "Live" : "Offline"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            data-testid="button-refresh"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-active-validators">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Validators</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.activeValidators}</div>
            <p className="text-xs text-muted-foreground">
              of {overview.totalValidators} total
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-blocked-validators">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Validators</CardTitle>
            <Ban className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{overview.blockedValidators}</div>
            <p className="text-xs text-muted-foreground">
              Due to security violations
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-alerts-24h">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts (24h)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalAlerts24h}</div>
            <p className="text-xs text-muted-foreground">
              {overview.criticalAlerts} critical
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-success-rate">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Avg latency: {overview.avgLatencyMs.toFixed(0)}ms
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">
            <Shield className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="alerts" data-testid="tab-alerts">
            <ShieldAlert className="h-4 w-4 mr-2" />
            Alerts
            {alerts.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {alerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rate-limits" data-testid="tab-rate-limits">
            <Gauge className="h-4 w-4 mr-2" />
            Rate Limits
          </TabsTrigger>
          <TabsTrigger value="ip-whitelist" data-testid="tab-ip-whitelist">
            <Network className="h-4 w-4 mr-2" />
            IP Whitelist
          </TabsTrigger>
          <TabsTrigger value="audit-logs" data-testid="tab-audit-logs">
            <FileText className="h-4 w-4 mr-2" />
            Audit Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Status</CardTitle>
                <CardDescription>Current security posture of external validators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Rate Limiting</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <Progress value={100} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Anomaly Detection</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <Progress value={100} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Nonce Tracking</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <Progress value={100} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Audit Logging</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <Progress value={100} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest security events</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  {alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                      <ShieldAlert className={`h-4 w-4 ${alert.severity === "critical" ? "text-red-500" : "text-yellow-500"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{alert.type}</p>
                        <p className="text-xs text-muted-foreground truncate">{alert.message}</p>
                      </div>
                      <Badge variant={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                    </div>
                  ))}
                  {alerts.length === 0 && (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      No recent alerts
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Alerts</CardTitle>
              <CardDescription>Real-time security alerts from external validators</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Validator</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map((alert) => (
                    <TableRow key={alert.id} data-testid={`row-alert-${alert.id}`}>
                      <TableCell className="font-medium">{alert.type}</TableCell>
                      <TableCell>
                        <Badge variant={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {alert.validatorAddress.slice(0, 10)}...
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{alert.message}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {alerts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No security alerts
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rate-limits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rate Limit Status</CardTitle>
              <CardDescription>Monitor rate limiting for each validator</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Validator</TableHead>
                    <TableHead>Requests</TableHead>
                    <TableHead>Violations</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rateLimits.map((limit) => (
                    <TableRow key={limit.validatorAddress} data-testid={`row-ratelimit-${limit.validatorAddress}`}>
                      <TableCell className="font-mono text-xs">
                        {limit.validatorAddress.slice(0, 10)}...
                      </TableCell>
                      <TableCell>{limit.requests.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={limit.violations > 0 ? "destructive" : "secondary"}>
                          {limit.violations}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {limit.blocked ? (
                          <Badge variant="destructive">Blocked</Badge>
                        ) : (
                          <Badge variant="default">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {limit.blocked && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => unblockValidatorMutation.mutate(limit.validatorAddress)}
                            data-testid={`button-unblock-${limit.validatorAddress}`}
                          >
                            Unblock
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {rateLimits.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No rate limit data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ip-whitelist" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>IP Whitelist</CardTitle>
                <CardDescription>Manage allowed IP addresses for validator connections</CardDescription>
              </div>
              <Dialog open={showAddIPDialog} onOpenChange={setShowAddIPDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" data-testid="button-add-ip">
                    <Plus className="h-4 w-4 mr-2" />
                    Add IP
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add IP to Whitelist</DialogTitle>
                    <DialogDescription>
                      Add a new IP address or CIDR subnet to the whitelist
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="ip">IP Address / Subnet</Label>
                      <Input
                        id="ip"
                        placeholder="192.168.1.1 or 10.0.0.0/8"
                        value={newIP}
                        onChange={(e) => setNewIP(e.target.value)}
                        data-testid="input-new-ip"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        placeholder="Validator node location"
                        value={newIPDescription}
                        onChange={(e) => setNewIPDescription(e.target.value)}
                        data-testid="input-new-ip-description"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowAddIPDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => addIPMutation.mutate({ ip: newIP, description: newIPDescription })}
                      disabled={!newIP}
                      data-testid="button-confirm-add-ip"
                    >
                      Add IP
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>IP / Subnet</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Added By</TableHead>
                    <TableHead>Added At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ipWhitelist.map((entry) => (
                    <TableRow key={entry.ip} data-testid={`row-ip-${entry.ip}`}>
                      <TableCell className="font-mono">{entry.ip}</TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell>{entry.addedBy}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(entry.addedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeIPMutation.mutate(entry.ip)}
                          data-testid={`button-remove-ip-${entry.ip}`}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {ipWhitelist.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No IP addresses in whitelist
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit-logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>Security audit trail for validator operations</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Validator</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id} data-testid={`row-audit-${log.id}`}>
                        <TableCell className="text-muted-foreground whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getLevelColor(log.level)}>{log.level}</Badge>
                        </TableCell>
                        <TableCell>{log.category}</TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {log.validatorAddress ? `${log.validatorAddress.slice(0, 10)}...` : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                    {auditLogs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No audit logs available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {lastUpdate && (
        <p className="text-xs text-muted-foreground text-right">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
