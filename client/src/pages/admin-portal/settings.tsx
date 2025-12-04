import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Settings,
  Save,
  Bell,
  Globe,
  Shield,
  Database,
  Palette,
  Mail,
  Clock,
  Key,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Server,
  Activity,
} from "lucide-react";

interface SystemSettings {
  general: {
    chainName: string;
    chainId: string;
    rpcEndpoint: string;
    wsEndpoint: string;
    explorerUrl: string;
    timezone: string;
  };
  database: {
    autoBackup: boolean;
    dataRetention: string;
  };
  network: {
    blockTime: number;
    maxBlockSize: number;
    gasLimit: string;
    minGasPrice: string;
    maxValidators: number;
    minStake: string;
    aiEnhancedBft: boolean;
    dynamicSharding: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: string;
    ipWhitelist: boolean;
    rateLimiting: boolean;
    autoKeyRotation: string;
  };
  notifications: {
    criticalAlerts: boolean;
    securityEvents: boolean;
    validatorStatus: boolean;
    bridgeAlerts: boolean;
    aiSystemAlerts: boolean;
    maintenanceReminders: boolean;
    alertEmail: string;
    smtpServer: string;
  };
  appearance: {
    defaultTheme: string;
    defaultLanguage: string;
    compactMode: boolean;
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

export default function AdminSettings() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  const [localSettings, setLocalSettings] = useState<SystemSettings | null>(null);

  const { data: settings, isLoading, error, refetch } = useQuery<SystemSettings>({
    queryKey: ["/api/admin/settings"],
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: SystemSettings) => {
      const response = await apiRequest("POST", "/api/admin/settings", newSettings);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({
        title: t("adminSettings.saveSuccess"),
        description: t("adminSettings.saveSuccessDesc"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("adminSettings.saveError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRefresh = useCallback(() => {
    refetch();
    toast({
      title: t("adminSettings.refreshing"),
      description: t("adminSettings.refreshingDesc"),
    });
  }, [refetch, toast, t]);

  const handleSave = useCallback(() => {
    if (localSettings) {
      saveSettingsMutation.mutate(localSettings);
    }
  }, [localSettings, saveSettingsMutation]);

  const updateLocalSetting = useCallback((section: keyof SystemSettings, key: string, value: any) => {
    setLocalSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value,
        },
      };
    });
  }, []);

  const mockSettings: SystemSettings = {
    general: {
      chainName: "TBURN Mainnet",
      chainId: "8888",
      rpcEndpoint: "https://rpc.tburn.io",
      wsEndpoint: "wss://ws.tburn.io",
      explorerUrl: "https://explorer.tburn.io",
      timezone: "utc",
    },
    database: {
      autoBackup: true,
      dataRetention: "90",
    },
    network: {
      blockTime: 2,
      maxBlockSize: 2,
      gasLimit: "30000000",
      minGasPrice: "1",
      maxValidators: 200,
      minStake: "1000000",
      aiEnhancedBft: true,
      dynamicSharding: true,
    },
    security: {
      twoFactorAuth: true,
      sessionTimeout: "30",
      ipWhitelist: false,
      rateLimiting: true,
      autoKeyRotation: "90",
    },
    notifications: {
      criticalAlerts: true,
      securityEvents: true,
      validatorStatus: true,
      bridgeAlerts: false,
      aiSystemAlerts: false,
      maintenanceReminders: false,
      alertEmail: "alerts@tburn.io",
      smtpServer: "smtp.tburn.io",
    },
    appearance: {
      defaultTheme: "system",
      defaultLanguage: "en",
      compactMode: false,
    },
  };

  const currentSettings = localSettings || settings || mockSettings;

  if (error) {
    return (
      <div className="flex-1 overflow-auto" data-testid="settings-error-container">
        <div className="container max-w-[1800px] mx-auto p-6">
          <Card className="border-red-500/50 bg-red-500/10">
            <CardContent className="flex items-center gap-4 py-6">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div>
                <h3 className="font-semibold text-red-500">{t("adminSettings.errorLoading")}</h3>
                <p className="text-sm text-muted-foreground">{t("adminSettings.errorLoadingDesc")}</p>
              </div>
              <Button variant="outline" onClick={() => refetch()} className="ml-auto" data-testid="button-retry">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("adminSettings.retry")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" data-testid="settings-container">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-settings-title">
              <Settings className="h-8 w-8" />
              {t("adminSettings.title")}
            </h1>
            <p className="text-muted-foreground" data-testid="text-settings-subtitle">
              {t("adminSettings.subtitle")} | {i18n.language === 'ko' ? 'Configure system preferences and parameters' : '시스템 환경설정 및 매개변수 구성'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isLoading}
              data-testid="button-refresh-settings"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {t("adminSettings.refresh")}
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saveSettingsMutation.isPending}
              data-testid="button-save-settings"
            >
              {saveSettingsMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {t("adminSettings.saveChanges")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={Server}
            label={t("adminSettings.metrics.systemStatus")}
            value={t("adminSettings.metrics.online")}
            change={t("adminSettings.metrics.uptime")}
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-green-500/10"
            iconColor="text-green-500"
            testId="metric-system-status"
          />
          <MetricCard
            icon={Database}
            label={t("adminSettings.metrics.databaseHealth")}
            value="98.5%"
            change={t("adminSettings.metrics.healthy")}
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-blue-500/10"
            iconColor="text-blue-500"
            testId="metric-database-health"
          />
          <MetricCard
            icon={Activity}
            label={t("adminSettings.metrics.activeConnections")}
            value="1,247"
            change={`+12% ${t("adminSettings.metrics.fromLastHour")}`}
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-purple-500/10"
            iconColor="text-purple-500"
            testId="metric-active-connections"
          />
          <MetricCard
            icon={Clock}
            label={t("adminSettings.metrics.lastBackup")}
            value="2h ago"
            change={t("adminSettings.metrics.autoBackupEnabled")}
            changeType="neutral"
            isLoading={isLoading}
            bgColor="bg-orange-500/10"
            iconColor="text-orange-500"
            testId="metric-last-backup"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="settings-tabs">
          <TabsList className="grid w-full grid-cols-5" data-testid="settings-tabs-list">
            <TabsTrigger value="general" data-testid="tab-general">{t("adminSettings.tabs.general")}</TabsTrigger>
            <TabsTrigger value="network" data-testid="tab-network">{t("adminSettings.tabs.network")}</TabsTrigger>
            <TabsTrigger value="security" data-testid="tab-security">{t("adminSettings.tabs.security")}</TabsTrigger>
            <TabsTrigger value="notifications" data-testid="tab-notifications">{t("adminSettings.tabs.notifications")}</TabsTrigger>
            <TabsTrigger value="appearance" data-testid="tab-appearance">{t("adminSettings.tabs.appearance")}</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6" data-testid="content-general">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {t("adminSettings.general.title")}
                </CardTitle>
                <CardDescription>{t("adminSettings.general.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="chainName" data-testid="label-chain-name">{t("adminSettings.general.chainName")}</Label>
                      <Input 
                        id="chainName" 
                        value={currentSettings.general.chainName}
                        onChange={(e) => updateLocalSetting("general", "chainName", e.target.value)}
                        data-testid="input-chain-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="chainId" data-testid="label-chain-id">{t("adminSettings.general.chainId")}</Label>
                      <Input 
                        id="chainId" 
                        value={currentSettings.general.chainId}
                        onChange={(e) => updateLocalSetting("general", "chainId", e.target.value)}
                        data-testid="input-chain-id"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rpcEndpoint" data-testid="label-rpc-endpoint">{t("adminSettings.general.rpcEndpoint")}</Label>
                      <Input 
                        id="rpcEndpoint" 
                        value={currentSettings.general.rpcEndpoint}
                        onChange={(e) => updateLocalSetting("general", "rpcEndpoint", e.target.value)}
                        data-testid="input-rpc-endpoint"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="wsEndpoint" data-testid="label-ws-endpoint">{t("adminSettings.general.wsEndpoint")}</Label>
                      <Input 
                        id="wsEndpoint" 
                        value={currentSettings.general.wsEndpoint}
                        onChange={(e) => updateLocalSetting("general", "wsEndpoint", e.target.value)}
                        data-testid="input-ws-endpoint"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="explorerUrl" data-testid="label-explorer-url">{t("adminSettings.general.explorerUrl")}</Label>
                      <Input 
                        id="explorerUrl" 
                        value={currentSettings.general.explorerUrl}
                        onChange={(e) => updateLocalSetting("general", "explorerUrl", e.target.value)}
                        data-testid="input-explorer-url"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone" data-testid="label-timezone">{t("adminSettings.general.timezone")}</Label>
                      <Select 
                        value={currentSettings.general.timezone}
                        onValueChange={(value) => updateLocalSetting("general", "timezone", value)}
                      >
                        <SelectTrigger data-testid="select-timezone">
                          <SelectValue placeholder={t("adminSettings.general.selectTimezone")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="utc" data-testid="option-utc">UTC</SelectItem>
                          <SelectItem value="est" data-testid="option-est">EST (UTC-5)</SelectItem>
                          <SelectItem value="pst" data-testid="option-pst">PST (UTC-8)</SelectItem>
                          <SelectItem value="kst" data-testid="option-kst">KST (UTC+9)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  {t("adminSettings.database.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t("adminSettings.database.autoBackup")}</p>
                    <p className="text-sm text-muted-foreground">{t("adminSettings.database.autoBackupDesc")}</p>
                  </div>
                  <Switch 
                    checked={currentSettings.database.autoBackup}
                    onCheckedChange={(checked) => updateLocalSetting("database", "autoBackup", checked)}
                    data-testid="switch-auto-backup"
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t("adminSettings.database.dataRetention")}</p>
                    <p className="text-sm text-muted-foreground">{t("adminSettings.database.dataRetentionDesc")}</p>
                  </div>
                  <Select 
                    value={currentSettings.database.dataRetention}
                    onValueChange={(value) => updateLocalSetting("database", "dataRetention", value)}
                  >
                    <SelectTrigger className="w-[150px]" data-testid="select-data-retention">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">{t("adminSettings.database.days", { count: 30 })}</SelectItem>
                      <SelectItem value="60">{t("adminSettings.database.days", { count: 60 })}</SelectItem>
                      <SelectItem value="90">{t("adminSettings.database.days", { count: 90 })}</SelectItem>
                      <SelectItem value="180">{t("adminSettings.database.days", { count: 180 })}</SelectItem>
                      <SelectItem value="365">{t("adminSettings.database.days", { count: 365 })}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="network" className="space-y-6" data-testid="content-network">
            <Card>
              <CardHeader>
                <CardTitle>{t("adminSettings.network.title")}</CardTitle>
                <CardDescription>{t("adminSettings.network.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="blockTime" data-testid="label-block-time">{t("adminSettings.network.blockTime")}</Label>
                      <Input 
                        id="blockTime" 
                        type="number" 
                        value={currentSettings.network.blockTime}
                        onChange={(e) => updateLocalSetting("network", "blockTime", parseInt(e.target.value))}
                        data-testid="input-block-time"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxBlockSize" data-testid="label-max-block-size">{t("adminSettings.network.maxBlockSize")}</Label>
                      <Input 
                        id="maxBlockSize" 
                        type="number" 
                        value={currentSettings.network.maxBlockSize}
                        onChange={(e) => updateLocalSetting("network", "maxBlockSize", parseInt(e.target.value))}
                        data-testid="input-max-block-size"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gasLimit" data-testid="label-gas-limit">{t("adminSettings.network.gasLimit")}</Label>
                      <Input 
                        id="gasLimit" 
                        value={currentSettings.network.gasLimit}
                        onChange={(e) => updateLocalSetting("network", "gasLimit", e.target.value)}
                        data-testid="input-gas-limit"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minGasPrice" data-testid="label-min-gas-price">{t("adminSettings.network.minGasPrice")}</Label>
                      <Input 
                        id="minGasPrice" 
                        value={currentSettings.network.minGasPrice}
                        onChange={(e) => updateLocalSetting("network", "minGasPrice", e.target.value)}
                        data-testid="input-min-gas-price"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxValidators" data-testid="label-max-validators">{t("adminSettings.network.maxValidators")}</Label>
                      <Input 
                        id="maxValidators" 
                        type="number" 
                        value={currentSettings.network.maxValidators}
                        onChange={(e) => updateLocalSetting("network", "maxValidators", parseInt(e.target.value))}
                        data-testid="input-max-validators"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minStake" data-testid="label-min-stake">{t("adminSettings.network.minStake")}</Label>
                      <Input 
                        id="minStake" 
                        value={currentSettings.network.minStake}
                        onChange={(e) => updateLocalSetting("network", "minStake", e.target.value)}
                        data-testid="input-min-stake"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("adminSettings.consensus.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t("adminSettings.consensus.aiEnhancedBft")}</p>
                    <p className="text-sm text-muted-foreground">{t("adminSettings.consensus.aiEnhancedBftDesc")}</p>
                  </div>
                  <Switch 
                    checked={currentSettings.network.aiEnhancedBft}
                    onCheckedChange={(checked) => updateLocalSetting("network", "aiEnhancedBft", checked)}
                    data-testid="switch-ai-bft"
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t("adminSettings.consensus.dynamicSharding")}</p>
                    <p className="text-sm text-muted-foreground">{t("adminSettings.consensus.dynamicShardingDesc")}</p>
                  </div>
                  <Switch 
                    checked={currentSettings.network.dynamicSharding}
                    onCheckedChange={(checked) => updateLocalSetting("network", "dynamicSharding", checked)}
                    data-testid="switch-dynamic-sharding"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6" data-testid="content-security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {t("adminSettings.security.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t("adminSettings.security.twoFactorAuth")}</p>
                    <p className="text-sm text-muted-foreground">{t("adminSettings.security.twoFactorAuthDesc")}</p>
                  </div>
                  <Switch 
                    checked={currentSettings.security.twoFactorAuth}
                    onCheckedChange={(checked) => updateLocalSetting("security", "twoFactorAuth", checked)}
                    data-testid="switch-2fa"
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t("adminSettings.security.sessionTimeout")}</p>
                    <p className="text-sm text-muted-foreground">{t("adminSettings.security.sessionTimeoutDesc")}</p>
                  </div>
                  <Select 
                    value={currentSettings.security.sessionTimeout}
                    onValueChange={(value) => updateLocalSetting("security", "sessionTimeout", value)}
                  >
                    <SelectTrigger className="w-[150px]" data-testid="select-session-timeout">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">{t("adminSettings.security.minutes", { count: 15 })}</SelectItem>
                      <SelectItem value="30">{t("adminSettings.security.minutes", { count: 30 })}</SelectItem>
                      <SelectItem value="60">{t("adminSettings.security.minutes", { count: 60 })}</SelectItem>
                      <SelectItem value="120">{t("adminSettings.security.hours", { count: 2 })}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t("adminSettings.security.ipWhitelist")}</p>
                    <p className="text-sm text-muted-foreground">{t("adminSettings.security.ipWhitelistDesc")}</p>
                  </div>
                  <Switch 
                    checked={currentSettings.security.ipWhitelist}
                    onCheckedChange={(checked) => updateLocalSetting("security", "ipWhitelist", checked)}
                    data-testid="switch-ip-whitelist"
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t("adminSettings.security.rateLimiting")}</p>
                    <p className="text-sm text-muted-foreground">{t("adminSettings.security.rateLimitingDesc")}</p>
                  </div>
                  <Switch 
                    checked={currentSettings.security.rateLimiting}
                    onCheckedChange={(checked) => updateLocalSetting("security", "rateLimiting", checked)}
                    data-testid="switch-rate-limiting"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  {t("adminSettings.apiKeys.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t("adminSettings.apiKeys.autoRotation")}</p>
                    <p className="text-sm text-muted-foreground">{t("adminSettings.apiKeys.autoRotationDesc")}</p>
                  </div>
                  <Select 
                    value={currentSettings.security.autoKeyRotation}
                    onValueChange={(value) => updateLocalSetting("security", "autoKeyRotation", value)}
                  >
                    <SelectTrigger className="w-[150px]" data-testid="select-key-rotation">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">{t("adminSettings.apiKeys.days", { count: 30 })}</SelectItem>
                      <SelectItem value="60">{t("adminSettings.apiKeys.days", { count: 60 })}</SelectItem>
                      <SelectItem value="90">{t("adminSettings.apiKeys.days", { count: 90 })}</SelectItem>
                      <SelectItem value="never">{t("adminSettings.apiKeys.never")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6" data-testid="content-notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  {t("adminSettings.notifications.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "criticalAlerts", label: t("adminSettings.notifications.criticalAlerts"), desc: t("adminSettings.notifications.criticalAlertsDesc") },
                  { key: "securityEvents", label: t("adminSettings.notifications.securityEvents"), desc: t("adminSettings.notifications.securityEventsDesc") },
                  { key: "validatorStatus", label: t("adminSettings.notifications.validatorStatus"), desc: t("adminSettings.notifications.validatorStatusDesc") },
                  { key: "bridgeAlerts", label: t("adminSettings.notifications.bridgeAlerts"), desc: t("adminSettings.notifications.bridgeAlertsDesc") },
                  { key: "aiSystemAlerts", label: t("adminSettings.notifications.aiSystemAlerts"), desc: t("adminSettings.notifications.aiSystemAlertsDesc") },
                  { key: "maintenanceReminders", label: t("adminSettings.notifications.maintenanceReminders"), desc: t("adminSettings.notifications.maintenanceRemindersDesc") },
                ].map((item, index) => (
                  <div key={item.key}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch 
                        checked={currentSettings.notifications[item.key as keyof typeof currentSettings.notifications] as boolean}
                        onCheckedChange={(checked) => updateLocalSetting("notifications", item.key, checked)}
                        data-testid={`switch-${item.key}`}
                      />
                    </div>
                    {index < 5 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  {t("adminSettings.email.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="alertEmail" data-testid="label-alert-email">{t("adminSettings.email.alertEmail")}</Label>
                  <Input 
                    id="alertEmail" 
                    type="email" 
                    value={currentSettings.notifications.alertEmail}
                    onChange={(e) => updateLocalSetting("notifications", "alertEmail", e.target.value)}
                    data-testid="input-alert-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpServer" data-testid="label-smtp-server">{t("adminSettings.email.smtpServer")}</Label>
                  <Input 
                    id="smtpServer" 
                    value={currentSettings.notifications.smtpServer}
                    onChange={(e) => updateLocalSetting("notifications", "smtpServer", e.target.value)}
                    data-testid="input-smtp-server"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6" data-testid="content-appearance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  {t("adminSettings.appearance.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t("adminSettings.appearance.defaultTheme")}</p>
                    <p className="text-sm text-muted-foreground">{t("adminSettings.appearance.defaultThemeDesc")}</p>
                  </div>
                  <Select 
                    value={currentSettings.appearance.defaultTheme}
                    onValueChange={(value) => updateLocalSetting("appearance", "defaultTheme", value)}
                  >
                    <SelectTrigger className="w-[150px]" data-testid="select-default-theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">{t("adminSettings.appearance.light")}</SelectItem>
                      <SelectItem value="dark">{t("adminSettings.appearance.dark")}</SelectItem>
                      <SelectItem value="system">{t("adminSettings.appearance.system")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t("adminSettings.appearance.defaultLanguage")}</p>
                    <p className="text-sm text-muted-foreground">{t("adminSettings.appearance.defaultLanguageDesc")}</p>
                  </div>
                  <Select 
                    value={currentSettings.appearance.defaultLanguage}
                    onValueChange={(value) => updateLocalSetting("appearance", "defaultLanguage", value)}
                  >
                    <SelectTrigger className="w-[150px]" data-testid="select-default-language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ko">한국어</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t("adminSettings.appearance.compactMode")}</p>
                    <p className="text-sm text-muted-foreground">{t("adminSettings.appearance.compactModeDesc")}</p>
                  </div>
                  <Switch 
                    checked={currentSettings.appearance.compactMode}
                    onCheckedChange={(checked) => updateLocalSetting("appearance", "compactMode", checked)}
                    data-testid="switch-compact-mode"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
