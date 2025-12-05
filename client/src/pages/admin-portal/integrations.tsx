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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Plug,
  RefreshCw,
  Plus,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Link,
  Unlink,
  ExternalLink,
  Database,
  Cloud,
  Mail,
  Lock,
  Activity,
  Zap,
  Save,
  AlertCircle,
} from "lucide-react";
import { SiSlack, SiDiscord, SiGithub, SiTelegram, SiAmazon, SiGooglecloud } from "react-icons/si";

const integrationIconMap: Record<string, any> = {
  slack: SiSlack,
  discord: SiDiscord,
  telegram: SiTelegram,
  github: SiGithub,
  aws: SiAmazon,
  gcp: SiGooglecloud,
  azure: Cloud,
};

const integrationDescKeyMap: Record<string, string> = {
  slack: "slackDesc",
  discord: "discordDesc",
  telegram: "telegramDesc",
  github: "githubDesc",
  aws: "awsDesc",
  gcp: "gcpDesc",
  azure: "azureDesc",
};

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "connected" | "disconnected" | "error";
  lastSync?: string;
  icon?: any;
  config?: Record<string, string>;
}

interface IntegrationsData {
  integrations: Integration[];
  webhookConfig: {
    incomingUrl: string;
    secret: string;
    events: {
      blockCreated: boolean;
      transaction: boolean;
      alertTriggered: boolean;
      validatorUpdate: boolean;
    };
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

export default function Integrations() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");

  const { data: integrationsData, isLoading, error, refetch } = useQuery<IntegrationsData>({
    queryKey: ["/api/admin/integrations"],
    refetchInterval: 30000,
  });

  const saveIntegrationsMutation = useMutation({
    mutationFn: async (config: Partial<IntegrationsData>) => {
      const response = await apiRequest("POST", "/api/admin/integrations", config);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/integrations"] });
      toast({
        title: t("adminIntegrations.saveSuccess"),
        description: t("adminIntegrations.saveSuccessDesc"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("adminIntegrations.saveError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleIntegrationMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const response = await apiRequest("PATCH", `/api/admin/integrations/${id}`, { enabled });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/integrations"] });
      toast({
        title: t("adminIntegrations.integrationUpdated"),
        description: t("adminIntegrations.integrationUpdatedDesc"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("adminIntegrations.updateError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRefresh = useCallback(() => {
    refetch();
    toast({
      title: t("adminIntegrations.syncing"),
      description: t("adminIntegrations.syncingDesc"),
    });
  }, [refetch, toast, t]);

  const mockIntegrations: Integration[] = [
    {
      id: "1",
      name: "Slack",
      description: t("adminIntegrations.integrations.slackDesc"),
      category: "messaging",
      status: "connected",
      lastSync: "2024-12-04 14:30:00",
      icon: SiSlack,
    },
    {
      id: "2",
      name: "Discord",
      description: t("adminIntegrations.integrations.discordDesc"),
      category: "messaging",
      status: "connected",
      lastSync: "2024-12-04 14:25:00",
      icon: SiDiscord,
    },
    {
      id: "3",
      name: "Telegram",
      description: t("adminIntegrations.integrations.telegramDesc"),
      category: "messaging",
      status: "disconnected",
      icon: SiTelegram,
    },
    {
      id: "4",
      name: "GitHub",
      description: t("adminIntegrations.integrations.githubDesc"),
      category: "development",
      status: "connected",
      lastSync: "2024-12-04 10:00:00",
      icon: SiGithub,
    },
    {
      id: "5",
      name: "AWS",
      description: t("adminIntegrations.integrations.awsDesc"),
      category: "cloud",
      status: "connected",
      lastSync: "2024-12-04 14:00:00",
      icon: SiAmazon,
    },
    {
      id: "6",
      name: "Google Cloud",
      description: t("adminIntegrations.integrations.gcpDesc"),
      category: "cloud",
      status: "error",
      lastSync: "2024-12-03 18:00:00",
      icon: SiGooglecloud,
    },
    {
      id: "7",
      name: "Azure",
      description: t("adminIntegrations.integrations.azureDesc"),
      category: "cloud",
      status: "disconnected",
      icon: Cloud,
    },
  ];

  const integrations = integrationsData?.integrations || mockIntegrations;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Unlink className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const filteredIntegrations = activeTab === "all" 
    ? integrations 
    : integrations.filter(i => i.category === activeTab);

  const connectedCount = integrations.filter(i => i.status === "connected").length;
  const disconnectedCount = integrations.filter(i => i.status === "disconnected").length;
  const errorCount = integrations.filter(i => i.status === "error").length;

  if (error) {
    return (
      <div className="flex-1 overflow-auto" data-testid="integrations-error-container">
        <div className="container max-w-[1800px] mx-auto p-6">
          <Card className="border-red-500/50 bg-red-500/10">
            <CardContent className="flex items-center gap-4 py-6">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div>
                <h3 className="font-semibold text-red-500">{t("adminIntegrations.errorLoading")}</h3>
                <p className="text-sm text-muted-foreground">{t("adminIntegrations.errorLoadingDesc")}</p>
              </div>
              <Button variant="outline" onClick={() => refetch()} className="ml-auto" data-testid="button-retry">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("adminIntegrations.retry")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" data-testid="integrations-container">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-integrations-title">
              <Plug className="h-8 w-8" />
              {t("adminIntegrations.title")}
            </h1>
            <p className="text-muted-foreground" data-testid="text-integrations-subtitle">
              {t("adminIntegrations.subtitle")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading} data-testid="button-sync-all">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {t("adminIntegrations.syncAll")}
            </Button>
            <Button onClick={() => saveIntegrationsMutation.mutate({})} disabled={saveIntegrationsMutation.isPending} data-testid="button-save">
              {saveIntegrationsMutation.isPending ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {t("adminIntegrations.saveChanges")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={Plug}
            label={t("adminIntegrations.metrics.totalIntegrations")}
            value={integrations.length}
            change={t("adminIntegrations.metrics.configuredServices")}
            changeType="neutral"
            isLoading={isLoading}
            bgColor="bg-blue-500/10"
            iconColor="text-blue-500"
            testId="metric-total-integrations"
          />
          <MetricCard
            icon={CheckCircle}
            label={t("adminIntegrations.metrics.connected")}
            value={connectedCount}
            change={t("adminIntegrations.metrics.activeConnections")}
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-green-500/10"
            iconColor="text-green-500"
            testId="metric-connected"
          />
          <MetricCard
            icon={Unlink}
            label={t("adminIntegrations.metrics.disconnected")}
            value={disconnectedCount}
            change={t("adminIntegrations.metrics.inactiveServices")}
            changeType="neutral"
            isLoading={isLoading}
            bgColor="bg-gray-500/10"
            iconColor="text-gray-500"
            testId="metric-disconnected"
          />
          <MetricCard
            icon={AlertTriangle}
            label={t("adminIntegrations.metrics.errors")}
            value={errorCount}
            change={t("adminIntegrations.metrics.needsAttention")}
            changeType={errorCount > 0 ? "negative" : "neutral"}
            isLoading={isLoading}
            bgColor="bg-red-500/10"
            iconColor="text-red-500"
            testId="metric-errors"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="integrations-tabs">
          <TabsList data-testid="integrations-tabs-list">
            <TabsTrigger value="all" data-testid="tab-all">{t("adminIntegrations.tabs.all")}</TabsTrigger>
            <TabsTrigger value="messaging" data-testid="tab-messaging">{t("adminIntegrations.tabs.messaging")}</TabsTrigger>
            <TabsTrigger value="cloud" data-testid="tab-cloud">{t("adminIntegrations.tabs.cloud")}</TabsTrigger>
            <TabsTrigger value="development" data-testid="tab-development">{t("adminIntegrations.tabs.development")}</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4 mt-4" data-testid="content-integrations">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-48 mt-2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredIntegrations.map((integration) => (
                  <Card key={integration.id} className="relative" data-testid={`card-integration-${integration.id}`}>
                    <CardHeader className="flex flex-row items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          {(() => {
                            const IconComponent = integration.icon || integrationIconMap[integration.id] || Plug;
                            return <IconComponent className="h-6 w-6" />;
                          })()}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {integrationDescKeyMap[integration.id] 
                              ? t(`adminIntegrations.integrations.${integrationDescKeyMap[integration.id]}`)
                              : integration.description}
                          </CardDescription>
                        </div>
                      </div>
                      {getStatusIcon(integration.status)}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{t("adminIntegrations.status")}</span>
                        <Badge variant={integration.status === "connected" ? "default" : integration.status === "error" ? "destructive" : "secondary"}>
                          {t(`adminIntegrations.statusTypes.${integration.status}`)}
                        </Badge>
                      </div>
                      {integration.lastSync && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{t("adminIntegrations.lastSync")}</span>
                          <span className="text-sm">{integration.lastSync}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex gap-2">
                        {integration.status === "connected" ? (
                          <>
                            <Button variant="outline" size="sm" className="flex-1" data-testid={`button-configure-${integration.id}`}>
                              <Settings className="h-4 w-4 mr-1" />
                              {t("adminIntegrations.configure")}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 text-red-500"
                              onClick={() => toggleIntegrationMutation.mutate({ id: integration.id, enabled: false })}
                              data-testid={`button-disconnect-${integration.id}`}
                            >
                              <Unlink className="h-4 w-4 mr-1" />
                              {t("adminIntegrations.disconnect")}
                            </Button>
                          </>
                        ) : (
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => toggleIntegrationMutation.mutate({ id: integration.id, enabled: true })}
                            data-testid={`button-connect-${integration.id}`}
                          >
                            <Link className="h-4 w-4 mr-1" />
                            {t("adminIntegrations.connect")}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Card className="border-dashed" data-testid="card-add-integration">
                  <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] gap-4">
                    <div className="p-4 bg-muted rounded-full">
                      <Plus className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{t("adminIntegrations.addNew.title")}</p>
                      <p className="text-sm text-muted-foreground">{t("adminIntegrations.addNew.description")}</p>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" data-testid="button-browse-integrations">
                          {t("adminIntegrations.addNew.browse")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{t("adminIntegrations.addNew.dialogTitle")}</DialogTitle>
                          <DialogDescription>{t("adminIntegrations.addNew.dialogDescription")}</DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="p-4 border rounded-lg hover:bg-muted cursor-pointer flex items-center gap-3" data-testid="option-postgresql">
                            <Database className="h-8 w-8" />
                            <div>
                              <p className="font-medium">PostgreSQL</p>
                              <p className="text-sm text-muted-foreground">{t("adminIntegrations.addNew.options.postgresql")}</p>
                            </div>
                          </div>
                          <div className="p-4 border rounded-lg hover:bg-muted cursor-pointer flex items-center gap-3" data-testid="option-sendgrid">
                            <Mail className="h-8 w-8" />
                            <div>
                              <p className="font-medium">SendGrid</p>
                              <p className="text-sm text-muted-foreground">{t("adminIntegrations.addNew.options.sendgrid")}</p>
                            </div>
                          </div>
                          <div className="p-4 border rounded-lg hover:bg-muted cursor-pointer flex items-center gap-3" data-testid="option-datadog">
                            <Activity className="h-8 w-8" />
                            <div>
                              <p className="font-medium">Datadog</p>
                              <p className="text-sm text-muted-foreground">{t("adminIntegrations.addNew.options.datadog")}</p>
                            </div>
                          </div>
                          <div className="p-4 border rounded-lg hover:bg-muted cursor-pointer flex items-center gap-3" data-testid="option-auth0">
                            <Lock className="h-8 w-8" />
                            <div>
                              <p className="font-medium">Auth0</p>
                              <p className="text-sm text-muted-foreground">{t("adminIntegrations.addNew.options.auth0")}</p>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Card data-testid="card-webhook-config">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              {t("adminIntegrations.webhooks.title")}
            </CardTitle>
            <CardDescription>{t("adminIntegrations.webhooks.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label data-testid="label-incoming-webhook">{t("adminIntegrations.webhooks.incomingUrl")}</Label>
                <div className="flex gap-2">
                  <Input defaultValue="https://api.tburn.io/webhooks/incoming/abc123" readOnly data-testid="input-incoming-webhook" />
                  <Button variant="outline" size="icon" data-testid="button-open-webhook">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{t("adminIntegrations.webhooks.incomingUrlDesc")}</p>
              </div>
              <div className="space-y-2">
                <Label data-testid="label-webhook-secret">{t("adminIntegrations.webhooks.secret")}</Label>
                <div className="flex gap-2">
                  <Input type="password" defaultValue="whsec_xxxxxxxxxxxxx" data-testid="input-webhook-secret" />
                  <Button variant="outline" data-testid="button-regenerate-secret">{t("adminIntegrations.webhooks.regenerate")}</Button>
                </div>
                <p className="text-xs text-muted-foreground">{t("adminIntegrations.webhooks.secretDesc")}</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>{t("adminIntegrations.webhooks.outgoingEvents")}</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">{t("adminIntegrations.webhooks.events.blockCreated")}</span>
                  <Switch defaultChecked data-testid="switch-event-block-created" />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">{t("adminIntegrations.webhooks.events.transaction")}</span>
                  <Switch defaultChecked data-testid="switch-event-transaction" />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">{t("adminIntegrations.webhooks.events.alertTriggered")}</span>
                  <Switch defaultChecked data-testid="switch-event-alert" />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">{t("adminIntegrations.webhooks.events.validatorUpdate")}</span>
                  <Switch data-testid="switch-event-validator" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
