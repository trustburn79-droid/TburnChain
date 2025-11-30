import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Key, 
  Trash2, 
  Copy, 
  Plus, 
  Shield, 
  Settings, 
  Activity, 
  RefreshCw,
  Clock,
  Globe,
  Lock,
  Gauge,
  Eye,
  RotateCcw,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calendar,
  Zap,
  Server,
} from "lucide-react";

interface ApiKey {
  id: string;
  label: string;
  description: string | null;
  keyPrefix: string | null;
  userId: string | null;
  scopes: string[];
  environment: string;
  expiresAt: string | null;
  rateLimitPerMinute: number;
  rateLimitPerHour: number;
  rateLimitPerDay: number;
  ipWhitelist: string[] | null;
  isActive: boolean;
  totalRequests: number;
  requestsToday: number;
  requestsThisMonth: number;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  status: 'active' | 'inactive' | 'expired' | 'revoked';
}

interface ApiKeyLog {
  id: string;
  apiKeyId: string;
  action: string;
  details: Record<string, any>;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface NewApiKeyResponse {
  id: string;
  label: string;
  description: string | null;
  key: string;
  keyPrefix: string;
  scopes: string[];
  environment: string;
  expiresAt: string | null;
  rateLimitPerMinute: number;
  rateLimitPerHour: number;
  rateLimitPerDay: number;
  createdAt: string;
}

interface ApiKeyStats {
  totalRequests: number;
  requestsToday: number;
  requestsThisMonth: number;
  errorCount: number;
}

const AVAILABLE_SCOPES = [
  { id: 'read', label: 'Read', description: 'Read-only access to data' },
  { id: 'write', label: 'Write', description: 'Create and update data' },
  { id: 'admin', label: 'Admin', description: 'Full administrative access' },
  { id: 'defi', label: 'DeFi', description: 'Access to DeFi endpoints' },
  { id: 'staking', label: 'Staking', description: 'Staking operations' },
  { id: 'governance', label: 'Governance', description: 'Governance actions' },
  { id: 'analytics', label: 'Analytics', description: 'Analytics and reporting' },
];

const ENVIRONMENTS = [
  { id: 'production', label: 'Production', color: 'bg-red-500' },
  { id: 'staging', label: 'Staging', color: 'bg-yellow-500' },
  { id: 'development', label: 'Development', color: 'bg-green-500' },
  { id: 'test', label: 'Test', color: 'bg-blue-500' },
];

export default function ApiKeys() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [deleteKeyId, setDeleteKeyId] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<NewApiKeyResponse | null>(null);
  
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['read']);
  const [environment, setEnvironment] = useState("development");
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(undefined);
  const [rateLimitPerMinute, setRateLimitPerMinute] = useState(60);
  const [rateLimitPerHour, setRateLimitPerHour] = useState(1000);
  const [rateLimitPerDay, setRateLimitPerDay] = useState(10000);
  const [ipWhitelist, setIpWhitelist] = useState("");

  const { data: keys = [], isLoading } = useQuery<ApiKey[]>({
    queryKey: ["/api/keys"],
  });

  const { data: recentLogs = [] } = useQuery<ApiKeyLog[]>({
    queryKey: ["/api/keys-logs/recent"],
    refetchInterval: 30000,
  });

  const { data: selectedKeyStats } = useQuery<ApiKeyStats>({
    queryKey: ["/api/keys", selectedKey?.id, "stats"],
    enabled: !!selectedKey,
  });

  const { data: selectedKeyLogs = [] } = useQuery<ApiKeyLog[]>({
    queryKey: ["/api/keys", selectedKey?.id, "logs"],
    enabled: !!selectedKey,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!label.trim()) {
        throw new Error(t('apiKeys.keyLabel'));
      }
      const res = await apiRequest("POST", "/api/keys", {
        label: label.trim(),
        description: description.trim() || null,
        scopes: selectedScopes,
        environment,
        expiresAt: expiresAt ? expiresAt.toISOString() : null,
        rateLimitPerMinute,
        rateLimitPerHour,
        rateLimitPerDay,
        ipWhitelist: ipWhitelist ? ipWhitelist.split(',').map(ip => ip.trim()).filter(Boolean) : [],
      });
      return await res.json() as NewApiKeyResponse;
    },
    onSuccess: (data) => {
      setNewKey(data);
      setShowCreateDialog(false);
      setShowNewKeyDialog(true);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/keys"] });
      toast({
        title: t('apiKeys.keyCreated'),
        description: t('apiKeys.keyCreatedToast'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message || t('apiKeys.createFailed'),
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/keys/${id}`, { reason: "Manual revocation" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/keys"] });
      queryClient.invalidateQueries({ queryKey: ["/api/keys-logs/recent"] });
      toast({
        title: t('apiKeys.keyRevoked'),
        description: t('apiKeys.keyRevokedDesc'),
      });
      setDeleteKeyId(null);
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message || t('apiKeys.revokeFailed'),
        variant: "destructive",
      });
      setDeleteKeyId(null);
    },
  });

  const rotateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/keys/${id}/rotate`);
      return await res.json();
    },
    onSuccess: (data) => {
      setNewKey(data);
      setShowDetailsDialog(false);
      setShowNewKeyDialog(true);
      queryClient.invalidateQueries({ queryKey: ["/api/keys"] });
      toast({
        title: "Key Rotated",
        description: "Your API key has been rotated. Please save the new key.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setLabel("");
    setDescription("");
    setSelectedScopes(['read']);
    setEnvironment("development");
    setExpiresAt(undefined);
    setRateLimitPerMinute(60);
    setRateLimitPerHour(1000);
    setRateLimitPerDay(10000);
    setIpWhitelist("");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t('common.copied'),
      description: t('apiKeys.apiKeyCopied'),
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = i18n.language || 'en';
    return date.toLocaleDateString(locale) + " " + date.toLocaleTimeString(locale);
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" />Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" />Inactive</Badge>;
      case 'expired':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Expired</Badge>;
      case 'revoked':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Revoked</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getEnvironmentBadge = (env: string) => {
    const envConfig = ENVIRONMENTS.find(e => e.id === env);
    return (
      <Badge variant="outline" className="gap-1">
        <span className={`w-2 h-2 rounded-full ${envConfig?.color || 'bg-gray-500'}`} />
        {envConfig?.label || env}
      </Badge>
    );
  };

  const activeKeys = keys.filter(k => k.status === 'active');
  const inactiveKeys = keys.filter(k => k.status !== 'active');
  const totalRequests = keys.reduce((sum, k) => sum + (k.totalRequests || 0), 0);
  const requestsToday = keys.reduce((sum, k) => sum + (k.requestsToday || 0), 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-page-title">
            <Shield className="h-8 w-8" />
            {t('apiKeys.title')}
          </h1>
          <p className="text-muted-foreground mt-2">
            Enterprise-grade API key management with granular permissions
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-api-key">
          <Plus className="mr-2 h-4 w-4" />
          Create API Key
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Keys</p>
                <p className="text-2xl font-bold" data-testid="text-total-keys">{keys.length}</p>
              </div>
              <Key className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Keys</p>
                <p className="text-2xl font-bold text-green-600" data-testid="text-active-keys">{activeKeys.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold" data-testid="text-total-requests">{totalRequests.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Requests Today</p>
                <p className="text-2xl font-bold text-blue-600" data-testid="text-requests-today">{requestsToday.toLocaleString()}</p>
              </div>
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="keys" className="w-full">
        <TabsList>
          <TabsTrigger value="keys" data-testid="tab-keys">
            <Key className="w-4 h-4 mr-2" />
            API Keys ({keys.length})
          </TabsTrigger>
          <TabsTrigger value="activity" data-testid="tab-activity">
            <Activity className="w-4 h-4 mr-2" />
            Activity Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                {t('apiKeys.activeKeys')}
              </CardTitle>
              <CardDescription>
                {keys.length === 0
                  ? t('apiKeys.noKeysYet')
                  : `Manage your ${keys.length} API keys with enterprise security features`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">{t('apiKeys.loadingKeys')}</div>
              ) : keys.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No API Keys Yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first API key to get started</p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create API Key
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Key</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                      <TableHead>Environment</TableHead>
                      <TableHead>Scopes</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>{t('apiKeys.lastUsed')}</TableHead>
                      <TableHead className="text-right">{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {keys.map((key) => (
                      <TableRow 
                        key={key.id} 
                        data-testid={`row-api-key-${key.id}`}
                        className="cursor-pointer hover-elevate"
                        onClick={() => {
                          setSelectedKey(key);
                          setShowDetailsDialog(true);
                        }}
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{key.label}</span>
                            <span className="text-xs text-muted-foreground font-mono">
                              {key.keyPrefix ? `${key.keyPrefix}...` : '••••••••'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(key.status)}
                        </TableCell>
                        <TableCell>
                          {getEnvironmentBadge(key.environment)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {(key.scopes || []).slice(0, 2).map(scope => (
                              <Badge key={scope} variant="secondary" className="text-xs">
                                {scope}
                              </Badge>
                            ))}
                            {(key.scopes || []).length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{(key.scopes || []).length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm">{(key.totalRequests || 0).toLocaleString()} total</span>
                            <span className="text-xs text-muted-foreground">{(key.requestsToday || 0).toLocaleString()} today</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {key.lastUsedAt ? formatRelativeTime(key.lastUsedAt) : t('apiKeys.never')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end" onClick={e => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedKey(key);
                                setShowDetailsDialog(true);
                              }}
                              data-testid={`button-view-${key.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteKeyId(key.id)}
                              data-testid={`button-revoke-${key.id}`}
                              disabled={key.status === 'revoked'}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Audit log of all API key activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No activity recorded yet
                </div>
              ) : (
                <div className="space-y-3">
                  {recentLogs.slice(0, 20).map((log) => (
                    <div 
                      key={log.id} 
                      className="flex items-center justify-between p-3 rounded-md border"
                      data-testid={`log-entry-${log.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          log.action === 'created' ? 'bg-green-100 text-green-600 dark:bg-green-900' :
                          log.action === 'revoked' ? 'bg-red-100 text-red-600 dark:bg-red-900' :
                          log.action === 'rotated' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900' :
                          'bg-gray-100 text-gray-600 dark:bg-gray-800'
                        }`}>
                          {log.action === 'created' ? <Plus className="h-4 w-4" /> :
                           log.action === 'revoked' ? <Trash2 className="h-4 w-4" /> :
                           log.action === 'rotated' ? <RefreshCw className="h-4 w-4" /> :
                           <Settings className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium capitalize">{log.action}</p>
                          <p className="text-sm text-muted-foreground">
                            {log.ipAddress || 'Unknown IP'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {formatRelativeTime(log.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New API Key
            </DialogTitle>
            <DialogDescription>
              Configure your API key with enterprise security settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="key-label">Label *</Label>
              <Input
                id="key-label"
                data-testid="input-api-key-label"
                placeholder="e.g., Production Backend"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="key-description">Description</Label>
              <Textarea
                id="key-description"
                data-testid="input-api-key-description"
                placeholder="Optional description for this API key"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Environment *</Label>
              <Select value={environment} onValueChange={setEnvironment}>
                <SelectTrigger data-testid="select-environment">
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent>
                  {ENVIRONMENTS.map(env => (
                    <SelectItem key={env.id} value={env.id}>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${env.color}`} />
                        {env.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Permissions (Scopes)</Label>
              <div className="grid grid-cols-2 gap-3">
                {AVAILABLE_SCOPES.map(scope => (
                  <div 
                    key={scope.id} 
                    className="flex items-start space-x-3 p-3 rounded-md border"
                  >
                    <Checkbox
                      id={`scope-${scope.id}`}
                      checked={selectedScopes.includes(scope.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedScopes([...selectedScopes, scope.id]);
                        } else {
                          setSelectedScopes(selectedScopes.filter(s => s !== scope.id));
                        }
                      }}
                      data-testid={`checkbox-scope-${scope.id}`}
                    />
                    <div className="grid gap-1 leading-none">
                      <label htmlFor={`scope-${scope.id}`} className="text-sm font-medium cursor-pointer">
                        {scope.label}
                      </label>
                      <p className="text-xs text-muted-foreground">{scope.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Expiration Date (Optional)
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    data-testid="button-expires-at"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !expiresAt && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {expiresAt ? format(expiresAt, "PPP", { locale: enUS }) : "Select expiration date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={expiresAt}
                    onSelect={setExpiresAt}
                    locale={enUS}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                  {expiresAt && (
                    <div className="p-3 border-t">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setExpiresAt(undefined)}
                      >
                        Clear date
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">Leave empty for no expiration</p>
            </div>

            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Gauge className="h-4 w-4" />
                Rate Limits
              </Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rate-minute" className="text-xs">Per Minute</Label>
                  <Input
                    id="rate-minute"
                    type="number"
                    data-testid="input-rate-minute"
                    value={rateLimitPerMinute}
                    onChange={(e) => setRateLimitPerMinute(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rate-hour" className="text-xs">Per Hour</Label>
                  <Input
                    id="rate-hour"
                    type="number"
                    data-testid="input-rate-hour"
                    value={rateLimitPerHour}
                    onChange={(e) => setRateLimitPerHour(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rate-day" className="text-xs">Per Day</Label>
                  <Input
                    id="rate-day"
                    type="number"
                    data-testid="input-rate-day"
                    value={rateLimitPerDay}
                    onChange={(e) => setRateLimitPerDay(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="allowed-ips" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                IP Whitelist (Optional)
              </Label>
              <Input
                id="allowed-ips"
                data-testid="input-allowed-ips"
                placeholder="e.g., 192.168.1.1, 10.0.0.0/24"
                value={ipWhitelist}
                onChange={(e) => setIpWhitelist(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Comma-separated list of IP addresses or CIDR ranges</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !label.trim() || selectedScopes.length === 0}
              data-testid="button-confirm-create"
            >
              {createMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Key className="mr-2 h-4 w-4" />
                  Create API Key
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              API Key Created Successfully
            </DialogTitle>
            <DialogDescription>
              <span className="text-destructive font-medium">Important:</span> This is the only time you will see this key. Please copy and store it securely.
            </DialogDescription>
          </DialogHeader>
          {newKey && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-md border border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">Save this key now!</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      You won't be able to see this key again after closing this dialog.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Label</Label>
                <div className="font-medium">{newKey.label}</div>
              </div>

              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={newKey.key}
                    className="font-mono text-xs"
                    data-testid="input-new-api-key"
                  />
                  <Button
                    onClick={() => copyToClipboard(newKey.key)}
                    data-testid="button-copy-api-key"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Environment</Label>
                  <div>{getEnvironmentBadge(newKey.environment)}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Scopes</Label>
                  <div className="flex gap-1 flex-wrap mt-1">
                    {newKey.scopes.map(scope => (
                      <Badge key={scope} variant="secondary" className="text-xs">
                        {scope}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {newKey.expiresAt && (
                <div>
                  <Label className="text-xs text-muted-foreground">Expires</Label>
                  <div className="text-sm">{formatDate(newKey.expiresAt)}</div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowNewKeyDialog(false)}>
              I've Saved My Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Key Details
            </DialogTitle>
            <DialogDescription>
              View and manage this API key
            </DialogDescription>
          </DialogHeader>
          {selectedKey && (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{selectedKey.label}</h3>
                  <p className="text-sm text-muted-foreground font-mono">
                    {selectedKey.keyPrefix}...
                  </p>
                </div>
                {getStatusBadge(selectedKey.status)}
              </div>

              {selectedKey.description && (
                <div>
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <p className="text-sm">{selectedKey.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Environment</Label>
                  <div className="mt-1">{getEnvironmentBadge(selectedKey.environment)}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Scopes</Label>
                  <div className="flex gap-1 flex-wrap mt-1">
                    {(selectedKey.scopes || []).map(scope => (
                      <Badge key={scope} variant="secondary" className="text-xs">
                        {scope}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Usage Statistics
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 rounded-md bg-muted">
                    <p className="text-xs text-muted-foreground">Total Requests</p>
                    <p className="text-xl font-bold">{(selectedKey.totalRequests || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-md bg-muted">
                    <p className="text-xs text-muted-foreground">Today</p>
                    <p className="text-xl font-bold">{(selectedKey.requestsToday || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-md bg-muted">
                    <p className="text-xs text-muted-foreground">This Month</p>
                    <p className="text-xl font-bold">{(selectedKey.requestsThisMonth || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Gauge className="h-4 w-4" />
                  Rate Limits
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 rounded-md border">
                    <p className="text-xs text-muted-foreground">Per Minute</p>
                    <p className="font-bold">{selectedKey.rateLimitPerMinute}</p>
                  </div>
                  <div className="p-3 rounded-md border">
                    <p className="text-xs text-muted-foreground">Per Hour</p>
                    <p className="font-bold">{selectedKey.rateLimitPerHour}</p>
                  </div>
                  <div className="p-3 rounded-md border">
                    <p className="text-xs text-muted-foreground">Per Day</p>
                    <p className="font-bold">{selectedKey.rateLimitPerDay}</p>
                  </div>
                </div>
              </div>

              {selectedKey.ipWhitelist && selectedKey.ipWhitelist.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    IP Whitelist
                  </h4>
                  <div className="flex gap-2 flex-wrap">
                    {selectedKey.ipWhitelist.map(ip => (
                      <Badge key={ip} variant="outline" className="font-mono text-xs">
                        {ip}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p>{formatDate(selectedKey.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Used</p>
                  <p>{selectedKey.lastUsedAt ? formatDate(selectedKey.lastUsedAt) : 'Never'}</p>
                </div>
                {selectedKey.expiresAt && (
                  <div>
                    <p className="text-muted-foreground">Expires</p>
                    <p className={new Date(selectedKey.expiresAt) < new Date() ? 'text-destructive' : ''}>
                      {formatDate(selectedKey.expiresAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            {selectedKey?.status === 'active' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => selectedKey && rotateMutation.mutate(selectedKey.id)}
                  disabled={rotateMutation.isPending}
                  data-testid="button-rotate-key"
                >
                  {rotateMutation.isPending ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RotateCcw className="mr-2 h-4 w-4" />
                  )}
                  Rotate Key
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setShowDetailsDialog(false);
                    setDeleteKeyId(selectedKey.id);
                  }}
                  data-testid="button-revoke-key-dialog"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Revoke Key
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteKeyId} onOpenChange={() => setDeleteKeyId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {t('apiKeys.revokeTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('apiKeys.revokeDescription')}
              <br /><br />
              This action cannot be undone. Any applications using this key will immediately lose access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-revoke">{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteKeyId && deleteMutation.mutate(deleteKeyId)}
              className="bg-destructive hover:bg-destructive/90"
              data-testid="button-confirm-revoke"
            >
              {deleteMutation.isPending ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              {t('apiKeys.revokeKey')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
