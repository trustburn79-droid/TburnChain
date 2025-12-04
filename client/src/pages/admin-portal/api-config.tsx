import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Globe,
  Key,
  Shield,
  Clock,
  RefreshCw,
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Settings,
  Activity,
  Save,
  RotateCcw,
  Lock,
  Unlock,
  AlertCircle,
  Download,
} from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string;
  status: "active" | "inactive" | "expired";
  permissions: string[];
  rateLimit: number;
  usageCount: number;
}

interface RateLimitConfig {
  endpoint: string;
  limit: number;
  window: string;
  currentUsage: number;
}

interface ApiConfigData {
  apiKeys: ApiKey[];
  rateLimits: RateLimitConfig[];
  settings: {
    httpsOnly: boolean;
    keyRotation: boolean;
    ipWhitelisting: boolean;
    requestSigning: boolean;
    corsOrigins: string;
  };
}

function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  change, 
  changeType = "neutral",
  isLoading = false,
  bgColor = "bg-blue-500/10",
  iconColor = "text-blue-500",
  testId
}: {
  icon: any;
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  isLoading?: boolean;
  bgColor?: string;
  iconColor?: string;
  testId?: string;
}) {
  return (
    <Card data-testid={testId}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {change && (
              <p className={`text-xs ${
                changeType === "positive" ? "text-green-500" : 
                changeType === "negative" ? "text-red-500" : 
                "text-muted-foreground"
              }`}>
                {change}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function ApiConfig() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("keys");
  const [showKey, setShowKey] = useState<string | null>(null);

  const { data: apiConfig, isLoading, error, refetch } = useQuery<ApiConfigData>({
    queryKey: ["/api/admin/config/api"],
    refetchInterval: 30000,
  });

  const saveConfigMutation = useMutation({
    mutationFn: async (config: Partial<ApiConfigData>) => {
      const response = await apiRequest("POST", "/api/admin/config/api", config);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/config/api"] });
      toast({
        title: t("adminApiConfig.saveSuccess"),
        description: t("adminApiConfig.saveSuccessDesc"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("adminApiConfig.saveError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createKeyMutation = useMutation({
    mutationFn: async (keyData: { name: string; permissions: string[]; rateLimit: number }) => {
      const response = await apiRequest("POST", "/api/admin/config/api/keys", keyData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/config/api"] });
      toast({
        title: t("adminApiConfig.keyCreated"),
        description: t("adminApiConfig.keyCreatedDesc"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("adminApiConfig.keyCreateError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/config/api/keys/${keyId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/config/api"] });
      toast({
        title: t("adminApiConfig.keyDeleted"),
        description: t("adminApiConfig.keyDeletedDesc"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("adminApiConfig.keyDeleteError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRefresh = useCallback(() => {
    refetch();
    toast({
      title: t("adminApiConfig.refreshing"),
      description: t("adminApiConfig.refreshingDesc"),
    });
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify(apiConfig, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `api-config-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: t("adminApiConfig.exported"),
      description: t("adminApiConfig.exportedDesc"),
    });
  }, [apiConfig, toast, t]);

  const mockApiKeys: ApiKey[] = [
    {
      id: "1",
      name: "Production API Key",
      key: "sk-live-xxxxxxxxxxxxxxxxxxxx",
      createdAt: "2024-01-15",
      lastUsed: "2024-12-04 14:23:45",
      status: "active",
      permissions: ["read", "write", "admin"],
      rateLimit: 10000,
      usageCount: 847293,
    },
    {
      id: "2",
      name: "Development API Key",
      key: "sk-dev-yyyyyyyyyyyyyyyyyyyy",
      createdAt: "2024-02-20",
      lastUsed: "2024-12-04 13:15:22",
      status: "active",
      permissions: ["read", "write"],
      rateLimit: 1000,
      usageCount: 12847,
    },
    {
      id: "3",
      name: "Analytics API Key",
      key: "sk-analytics-zzzzzzzzzzzzzz",
      createdAt: "2024-03-10",
      lastUsed: "2024-12-03 22:45:00",
      status: "inactive",
      permissions: ["read"],
      rateLimit: 5000,
      usageCount: 234567,
    },
  ];

  const mockRateLimits: RateLimitConfig[] = [
    { endpoint: "/api/blocks", limit: 100, window: "1m", currentUsage: 45 },
    { endpoint: "/api/transactions", limit: 200, window: "1m", currentUsage: 123 },
    { endpoint: "/api/wallets", limit: 50, window: "1m", currentUsage: 12 },
    { endpoint: "/api/validators", limit: 30, window: "1m", currentUsage: 8 },
    { endpoint: "/api/admin/*", limit: 20, window: "1m", currentUsage: 5 },
  ];

  const apiKeys = apiConfig?.apiKeys || mockApiKeys;
  const rateLimits = apiConfig?.rateLimits || mockRateLimits;

  if (error) {
    return (
      <div className="flex-1 overflow-auto" data-testid="api-config-error-container">
        <div className="container max-w-[1800px] mx-auto p-6">
          <Card className="border-red-500/50 bg-red-500/10">
            <CardContent className="flex items-center gap-4 py-6">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div>
                <h3 className="font-semibold text-red-500">{t("adminApiConfig.errorLoading")}</h3>
                <p className="text-sm text-muted-foreground">{t("adminApiConfig.errorLoadingDesc")}</p>
              </div>
              <Button variant="outline" onClick={() => refetch()} className="ml-auto" data-testid="button-retry">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("adminApiConfig.retry")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" data-testid="api-config-container">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-api-config-title">
              <Globe className="h-8 w-8" />
              {t("adminApiConfig.title")}
            </h1>
            <p className="text-muted-foreground" data-testid="text-api-config-subtitle">
              {t("adminApiConfig.subtitle")} | {i18n.language === 'ko' ? 'Manage API keys, rate limits, and endpoints' : 'API 설정 관리'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              {t("adminApiConfig.export")}
            </Button>
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading} data-testid="button-refresh">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {t("adminApiConfig.refresh")}
            </Button>
            <Button onClick={() => saveConfigMutation.mutate({})} disabled={saveConfigMutation.isPending} data-testid="button-save">
              {saveConfigMutation.isPending ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {t("adminApiConfig.saveChanges")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={Key}
            label={t("adminApiConfig.metrics.activeKeys")}
            value={apiKeys.filter(k => k.status === 'active').length}
            change={`${apiKeys.filter(k => k.status === 'inactive').length} ${t("adminApiConfig.metrics.inactive")}`}
            changeType="neutral"
            isLoading={isLoading}
            bgColor="bg-blue-500/10"
            iconColor="text-blue-500"
            testId="metric-active-keys"
          />
          <MetricCard
            icon={Activity}
            label={t("adminApiConfig.metrics.totalCalls24h")}
            value="1,094,707"
            change={`+12.3% ${t("adminApiConfig.metrics.fromYesterday")}`}
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-green-500/10"
            iconColor="text-green-500"
            testId="metric-total-calls"
          />
          <MetricCard
            icon={Shield}
            label={t("adminApiConfig.metrics.rateLimitStatus")}
            value={t("adminApiConfig.metrics.healthy")}
            change={t("adminApiConfig.metrics.allWithinLimits")}
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-purple-500/10"
            iconColor="text-purple-500"
            testId="metric-rate-limit-status"
          />
          <MetricCard
            icon={Clock}
            label={t("adminApiConfig.metrics.avgResponseTime")}
            value="45ms"
            change="P99: 124ms"
            changeType="neutral"
            isLoading={isLoading}
            bgColor="bg-orange-500/10"
            iconColor="text-orange-500"
            testId="metric-response-time"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="api-config-tabs">
          <TabsList className="grid w-full grid-cols-4" data-testid="api-config-tabs-list">
            <TabsTrigger value="keys" data-testid="tab-keys">{t("adminApiConfig.tabs.keys")}</TabsTrigger>
            <TabsTrigger value="rate-limits" data-testid="tab-rate-limits">{t("adminApiConfig.tabs.rateLimits")}</TabsTrigger>
            <TabsTrigger value="endpoints" data-testid="tab-endpoints">{t("adminApiConfig.tabs.endpoints")}</TabsTrigger>
            <TabsTrigger value="security" data-testid="tab-security">{t("adminApiConfig.tabs.security")}</TabsTrigger>
          </TabsList>

          <TabsContent value="keys" className="space-y-4" data-testid="content-keys">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <div>
                  <CardTitle>{t("adminApiConfig.keys.title")}</CardTitle>
                  <CardDescription>{t("adminApiConfig.keys.description")}</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button data-testid="button-create-key">
                      <Plus className="h-4 w-4 mr-2" />
                      {t("adminApiConfig.keys.createNew")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("adminApiConfig.keys.createTitle")}</DialogTitle>
                      <DialogDescription>{t("adminApiConfig.keys.createDescription")}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>{t("adminApiConfig.keys.keyName")}</Label>
                        <Input placeholder={t("adminApiConfig.keys.keyNamePlaceholder")} data-testid="input-key-name" />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("adminApiConfig.keys.permissions")}</Label>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span>{t("adminApiConfig.keys.permRead")}</span>
                            <Switch defaultChecked data-testid="switch-perm-read" />
                          </div>
                          <div className="flex items-center justify-between">
                            <span>{t("adminApiConfig.keys.permWrite")}</span>
                            <Switch data-testid="switch-perm-write" />
                          </div>
                          <div className="flex items-center justify-between">
                            <span>{t("adminApiConfig.keys.permAdmin")}</span>
                            <Switch data-testid="switch-perm-admin" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>{t("adminApiConfig.keys.rateLimit")}</Label>
                        <Input type="number" defaultValue="1000" data-testid="input-rate-limit" />
                      </div>
                      <Button className="w-full" data-testid="button-create-key-confirm">{t("adminApiConfig.keys.createButton")}</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("adminApiConfig.keys.tableName")}</TableHead>
                        <TableHead>{t("adminApiConfig.keys.tableKey")}</TableHead>
                        <TableHead>{t("adminApiConfig.keys.tableStatus")}</TableHead>
                        <TableHead>{t("adminApiConfig.keys.tablePermissions")}</TableHead>
                        <TableHead>{t("adminApiConfig.keys.tableRateLimit")}</TableHead>
                        <TableHead>{t("adminApiConfig.keys.tableUsage")}</TableHead>
                        <TableHead>{t("adminApiConfig.keys.tableLastUsed")}</TableHead>
                        <TableHead>{t("adminApiConfig.keys.tableActions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {apiKeys.map((key) => (
                        <TableRow key={key.id} data-testid={`row-api-key-${key.id}`}>
                          <TableCell className="font-medium">{key.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {showKey === key.id ? key.key : "sk-****-**********"}
                              </code>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowKey(showKey === key.id ? null : key.id)}
                                data-testid={`button-toggle-key-${key.id}`}
                              >
                                {showKey === key.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                              <Button variant="ghost" size="icon" data-testid={`button-copy-key-${key.id}`}>
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={key.status === "active" ? "default" : "secondary"}>
                              {t(`adminApiConfig.keys.status.${key.status}`)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {key.permissions.map((perm) => (
                                <Badge key={perm} variant="outline" className="text-xs">
                                  {t(`adminApiConfig.keys.perm.${perm}`)}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>{key.rateLimit.toLocaleString()}/min</TableCell>
                          <TableCell>{key.usageCount.toLocaleString()}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{key.lastUsed}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" data-testid={`button-settings-key-${key.id}`}>
                                <Settings className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" data-testid={`button-rotate-key-${key.id}`}>
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-red-500"
                                onClick={() => deleteKeyMutation.mutate(key.id)}
                                data-testid={`button-delete-key-${key.id}`}
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

          <TabsContent value="rate-limits" className="space-y-4" data-testid="content-rate-limits">
            <Card>
              <CardHeader>
                <CardTitle>{t("adminApiConfig.rateLimits.title")}</CardTitle>
                <CardDescription>{t("adminApiConfig.rateLimits.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("adminApiConfig.rateLimits.endpoint")}</TableHead>
                        <TableHead>{t("adminApiConfig.rateLimits.limit")}</TableHead>
                        <TableHead>{t("adminApiConfig.rateLimits.window")}</TableHead>
                        <TableHead>{t("adminApiConfig.rateLimits.currentUsage")}</TableHead>
                        <TableHead>{t("adminApiConfig.rateLimits.status")}</TableHead>
                        <TableHead>{t("adminApiConfig.rateLimits.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rateLimits.map((limit, index) => (
                        <TableRow key={limit.endpoint} data-testid={`row-rate-limit-${index}`}>
                          <TableCell className="font-mono">{limit.endpoint}</TableCell>
                          <TableCell>{limit.limit} {t("adminApiConfig.rateLimits.requests")}</TableCell>
                          <TableCell>{limit.window}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={(limit.currentUsage / limit.limit) * 100} className="w-20" />
                              <span className="text-sm">{limit.currentUsage}/{limit.limit}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={limit.currentUsage < limit.limit * 0.8 ? "default" : "destructive"}>
                              {limit.currentUsage < limit.limit * 0.8 ? t("adminApiConfig.rateLimits.ok") : t("adminApiConfig.rateLimits.warning")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" data-testid={`button-edit-rate-limit-${index}`}>
                              {t("adminApiConfig.rateLimits.edit")}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("adminApiConfig.globalRateLimits.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label data-testid="label-default-rate-limit">{t("adminApiConfig.globalRateLimits.defaultLimit")}</Label>
                    <Input type="number" defaultValue="100" data-testid="input-default-rate-limit" />
                    <p className="text-xs text-muted-foreground">{t("adminApiConfig.globalRateLimits.defaultLimitDesc")}</p>
                  </div>
                  <div className="space-y-2">
                    <Label data-testid="label-burst-limit">{t("adminApiConfig.globalRateLimits.burstLimit")}</Label>
                    <Input type="number" defaultValue="50" data-testid="input-burst-limit" />
                    <p className="text-xs text-muted-foreground">{t("adminApiConfig.globalRateLimits.burstLimitDesc")}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t("adminApiConfig.globalRateLimits.enableRateLimiting")}</p>
                    <p className="text-sm text-muted-foreground">{t("adminApiConfig.globalRateLimits.enableRateLimitingDesc")}</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-enable-rate-limiting" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="endpoints" className="space-y-4" data-testid="content-endpoints">
            <Card>
              <CardHeader>
                <CardTitle>{t("adminApiConfig.endpoints.title")}</CardTitle>
                <CardDescription>{t("adminApiConfig.endpoints.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label data-testid="label-rest-api-url">{t("adminApiConfig.endpoints.restApiUrl")}</Label>
                    <Input defaultValue="https://api.tburn.io/v1" data-testid="input-rest-api-url" />
                  </div>
                  <div className="space-y-2">
                    <Label data-testid="label-websocket-url">{t("adminApiConfig.endpoints.websocketUrl")}</Label>
                    <Input defaultValue="wss://ws.tburn.io" data-testid="input-websocket-url" />
                  </div>
                  <div className="space-y-2">
                    <Label data-testid="label-graphql-endpoint">{t("adminApiConfig.endpoints.graphqlEndpoint")}</Label>
                    <Input defaultValue="https://api.tburn.io/graphql" data-testid="input-graphql-endpoint" />
                  </div>
                  <div className="space-y-2">
                    <Label data-testid="label-rpc-endpoint">{t("adminApiConfig.endpoints.rpcEndpoint")}</Label>
                    <Input defaultValue="https://rpc.tburn.io" data-testid="input-rpc-endpoint" />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">{t("adminApiConfig.endpoints.accessControl")}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg" data-testid="endpoint-public">
                      <div className="flex items-center gap-3">
                        <Unlock className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium">/api/public/*</p>
                          <p className="text-sm text-muted-foreground">{t("adminApiConfig.endpoints.publicDesc")}</p>
                        </div>
                      </div>
                      <Badge>{t("adminApiConfig.endpoints.public")}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg" data-testid="endpoint-authenticated">
                      <div className="flex items-center gap-3">
                        <Key className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="font-medium">/api/v1/*</p>
                          <p className="text-sm text-muted-foreground">{t("adminApiConfig.endpoints.authenticatedDesc")}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{t("adminApiConfig.endpoints.apiKey")}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg" data-testid="endpoint-admin">
                      <div className="flex items-center gap-3">
                        <Lock className="h-5 w-5 text-red-500" />
                        <div>
                          <p className="font-medium">/api/admin/*</p>
                          <p className="text-sm text-muted-foreground">{t("adminApiConfig.endpoints.adminDesc")}</p>
                        </div>
                      </div>
                      <Badge variant="destructive">{t("adminApiConfig.endpoints.adminOnly")}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4" data-testid="content-security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {t("adminApiConfig.security.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t("adminApiConfig.security.httpsOnly")}</p>
                    <p className="text-sm text-muted-foreground">{t("adminApiConfig.security.httpsOnlyDesc")}</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-https-only" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t("adminApiConfig.security.keyRotation")}</p>
                    <p className="text-sm text-muted-foreground">{t("adminApiConfig.security.keyRotationDesc")}</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-key-rotation" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t("adminApiConfig.security.ipWhitelisting")}</p>
                    <p className="text-sm text-muted-foreground">{t("adminApiConfig.security.ipWhitelistingDesc")}</p>
                  </div>
                  <Switch data-testid="switch-ip-whitelisting" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t("adminApiConfig.security.requestSigning")}</p>
                    <p className="text-sm text-muted-foreground">{t("adminApiConfig.security.requestSigningDesc")}</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-request-signing" />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label data-testid="label-cors-origins">{t("adminApiConfig.security.corsOrigins")}</Label>
                  <Input defaultValue="https://tburn.io, https://app.tburn.io" data-testid="input-cors-origins" />
                  <p className="text-xs text-muted-foreground">{t("adminApiConfig.security.corsOriginsDesc")}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("adminApiConfig.securityAlerts.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-green-500/10" data-testid="alert-keys-secure">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">{t("adminApiConfig.securityAlerts.keysSecure")}</p>
                    <p className="text-sm text-muted-foreground">{t("adminApiConfig.securityAlerts.keysSecureDesc")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-yellow-500/10" data-testid="alert-key-rotation">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="font-medium">{t("adminApiConfig.securityAlerts.keyRotation")}</p>
                    <p className="text-sm text-muted-foreground">{t("adminApiConfig.securityAlerts.keyRotationDesc")}</p>
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
