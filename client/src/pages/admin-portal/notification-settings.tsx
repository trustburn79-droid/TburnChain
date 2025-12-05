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
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { DetailSheet, type DetailSection } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Volume2,
  VolumeX,
  RefreshCw,
  Save,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  Clock,
  Settings,
  Plus,
  Trash2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { SiSlack, SiDiscord, SiTelegram } from "react-icons/si";

interface NotificationChannel {
  id: string;
  type: string;
  name: string;
  enabled: boolean;
  destination: string;
}

interface NotificationSettings {
  channels: NotificationChannel[];
  preferences: {
    soundEnabled: boolean;
    volume: number;
    desktopNotifications: boolean;
    emailDigest: boolean;
    duplicateSuppression: boolean;
    batchWindow: string;
  };
  schedule: {
    quietHoursEnabled: boolean;
    quietHoursStart: string;
    quietHoursEnd: string;
    timezone: string;
    weekendNotifications: boolean;
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

export default function NotificationSettings() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("channels");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationVolume, setNotificationVolume] = useState([70]);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<NotificationChannel | null>(null);
  const [showSaveConfirmDialog, setShowSaveConfirmDialog] = useState(false);
  const [showTestConfirmDialog, setShowTestConfirmDialog] = useState(false);

  const { data: notificationSettings, isLoading, error, refetch } = useQuery<NotificationSettings>({
    queryKey: ["/api/admin/notifications/settings"],
    refetchInterval: 30000,
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<NotificationSettings>) => {
      const response = await apiRequest("POST", "/api/admin/notifications/settings", settings);
      return response.json();
    },
    onSuccess: () => {
      setShowSaveConfirmDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications/settings"] });
      toast({
        title: t("adminNotifications.saveSuccess"),
        description: t("adminNotifications.saveSuccessDesc"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("adminNotifications.saveError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const testNotificationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/notifications/test");
      return response.json();
    },
    onSuccess: () => {
      setShowTestConfirmDialog(false);
      toast({
        title: t("adminNotifications.testSent"),
        description: t("adminNotifications.testSentDesc"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("adminNotifications.testError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRefresh = useCallback(() => {
    refetch();
    toast({
      title: t("adminNotifications.refreshing"),
      description: t("adminNotifications.refreshingDesc"),
    });
  }, [refetch, toast, t]);

  const mockChannels: NotificationChannel[] = [
    { id: "1", type: "email", name: "Admin Email", enabled: true, destination: "admin@tburn.io" },
    { id: "2", type: "slack", name: "Alerts Channel", enabled: true, destination: "#tburn-alerts" },
    { id: "3", type: "discord", name: "Dev Server", enabled: true, destination: "#dev-notifications" },
    { id: "4", type: "telegram", name: "Ops Bot", enabled: false, destination: "@tburn_ops_bot" },
    { id: "5", type: "sms", name: "On-Call Phone", enabled: true, destination: "+1-xxx-xxx-xxxx" },
  ];

  const channels = notificationSettings?.channels || mockChannels;

  const getChannelDetailSections = useCallback((channel: NotificationChannel): DetailSection[] => [
    {
      title: t("adminNotifications.detail.channelInfo"),
      fields: [
        { label: t("adminNotifications.channels.name"), value: channel.name, type: "text" as const },
        { label: t("adminNotifications.channels.type"), value: channel.type.toUpperCase(), type: "badge" as const },
        { label: t("adminNotifications.channels.destination"), value: channel.destination, type: "text" as const, copyable: true },
        { label: t("adminNotifications.channels.status"), value: channel.enabled ? t("common.enabled") : t("common.disabled"), type: "badge" as const, badgeVariant: channel.enabled ? "default" : "secondary" },
      ],
    },
    {
      title: t("adminNotifications.detail.deliveryStatus"),
      fields: [
        { label: t("adminNotifications.detail.lastDelivery"), value: "2024-12-05 18:30:00", type: "text" as const },
        { label: t("adminNotifications.detail.deliveryRate"), value: "99.8%", type: "text" as const },
        { label: t("adminNotifications.detail.avgLatency"), value: "1.2s", type: "text" as const },
      ],
    },
  ], [t]);

  const handleViewChannel = (channel: NotificationChannel) => {
    setSelectedChannel(channel);
    setShowDetailSheet(true);
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="h-5 w-5" />;
      case "slack":
        return <SiSlack className="h-5 w-5" />;
      case "discord":
        return <SiDiscord className="h-5 w-5" />;
      case "telegram":
        return <SiTelegram className="h-5 w-5" />;
      case "sms":
        return <Smartphone className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const enabledChannels = channels.filter(c => c.enabled).length;

  if (error) {
    return (
      <div className="flex-1 overflow-auto" data-testid="notification-settings-error-container">
        <div className="container max-w-[1800px] mx-auto p-6">
          <Card className="border-red-500/50 bg-red-500/10">
            <CardContent className="flex items-center gap-4 py-6">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div>
                <h3 className="font-semibold text-red-500">{t("adminNotifications.errorLoading")}</h3>
                <p className="text-sm text-muted-foreground">{t("adminNotifications.errorLoadingDesc")}</p>
              </div>
              <Button variant="outline" onClick={() => refetch()} className="ml-auto" data-testid="button-retry">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("adminNotifications.retry")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" data-testid="notification-settings-container">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-notification-settings-title">
              <Bell className="h-8 w-8" />
              {t("adminNotifications.title")}
            </h1>
            <p className="text-muted-foreground" data-testid="text-notification-settings-subtitle">
              {t("adminNotifications.subtitle")} | {i18n.language === 'ko' ? 'Configure notification preferences and channels' : '알림 설정 관리'}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline" 
              onClick={() => setShowTestConfirmDialog(true)}
              disabled={testNotificationMutation.isPending}
              data-testid="button-test-notification"
            >
              {testNotificationMutation.isPending ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Bell className="h-4 w-4 mr-2" />}
              {t("adminNotifications.testNotification")}
            </Button>
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading} data-testid="button-refresh">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {t("adminNotifications.refresh")}
            </Button>
            <Button onClick={() => setShowSaveConfirmDialog(true)} disabled={saveSettingsMutation.isPending} data-testid="button-save">
              {saveSettingsMutation.isPending ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {t("adminNotifications.saveChanges")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={Bell}
            label={t("adminNotifications.metrics.activeChannels")}
            value={enabledChannels}
            change={`${t("adminNotifications.metrics.of")} ${channels.length} ${t("adminNotifications.metrics.channelsEnabled")}`}
            changeType="neutral"
            isLoading={isLoading}
            bgColor="bg-blue-500/10"
            iconColor="text-blue-500"
            testId="metric-active-channels"
          />
          <MetricCard
            icon={MessageSquare}
            label={t("adminNotifications.metrics.notificationsSent24h")}
            value="847"
            change={t("adminNotifications.metrics.allDelivered")}
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-green-500/10"
            iconColor="text-green-500"
            testId="metric-notifications-sent"
          />
          <MetricCard
            icon={AlertTriangle}
            label={t("adminNotifications.metrics.criticalAlerts")}
            value="3"
            change={t("adminNotifications.metrics.pendingAcknowledgment")}
            changeType="negative"
            isLoading={isLoading}
            bgColor="bg-red-500/10"
            iconColor="text-red-500"
            testId="metric-critical-alerts"
          />
          <MetricCard
            icon={Clock}
            label={t("adminNotifications.metrics.avgDeliveryTime")}
            value="1.2s"
            change={t("adminNotifications.metrics.acrossAllChannels")}
            changeType="neutral"
            isLoading={isLoading}
            bgColor="bg-orange-500/10"
            iconColor="text-orange-500"
            testId="metric-delivery-time"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="notification-settings-tabs">
          <TabsList className="grid w-full grid-cols-4" data-testid="notification-settings-tabs-list">
            <TabsTrigger value="channels" data-testid="tab-channels">{t("adminNotifications.tabs.channels")}</TabsTrigger>
            <TabsTrigger value="alerts" data-testid="tab-alerts">{t("adminNotifications.tabs.alertRules")}</TabsTrigger>
            <TabsTrigger value="schedule" data-testid="tab-schedule">{t("adminNotifications.tabs.schedule")}</TabsTrigger>
            <TabsTrigger value="preferences" data-testid="tab-preferences">{t("adminNotifications.tabs.preferences")}</TabsTrigger>
          </TabsList>

          <TabsContent value="channels" className="space-y-4" data-testid="content-channels">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <div>
                  <CardTitle>{t("adminNotifications.channels.title")}</CardTitle>
                  <CardDescription>{t("adminNotifications.channels.description")}</CardDescription>
                </div>
                <Button data-testid="button-add-channel">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("adminNotifications.channels.addChannel")}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))
                ) : (
                  channels.map((channel) => (
                    <div key={channel.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`channel-${channel.id}`}>
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-muted rounded-lg">
                          {getChannelIcon(channel.type)}
                        </div>
                        <div>
                          <p className="font-medium">{channel.name}</p>
                          <p className="text-sm text-muted-foreground">{channel.destination}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={channel.enabled ? "default" : "secondary"}>
                          {channel.enabled ? t("adminNotifications.channels.enabled") : t("adminNotifications.channels.disabled")}
                        </Badge>
                        <Switch defaultChecked={channel.enabled} data-testid={`switch-channel-${channel.id}`} />
                        <Button variant="ghost" size="icon" onClick={() => handleViewChannel(channel)} data-testid={`button-view-channel-${channel.id}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" data-testid={`button-settings-channel-${channel.id}`}>
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500" data-testid={`button-delete-channel-${channel.id}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4" data-testid="content-alerts">
            <Card>
              <CardHeader>
                <CardTitle>{t("adminNotifications.alerts.title")}</CardTitle>
                <CardDescription>{t("adminNotifications.alerts.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 border rounded-lg bg-red-500/10 border-red-500/30" data-testid="alert-severity-critical">
                    <XCircle className="h-6 w-6 text-red-500" />
                    <div className="flex-1">
                      <p className="font-medium text-red-500">{t("adminNotifications.alerts.critical")}</p>
                      <p className="text-sm text-muted-foreground">{t("adminNotifications.alerts.criticalDesc")}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline">{t("adminNotifications.alerts.channels.email")}</Badge>
                      <Badge variant="outline">{t("adminNotifications.alerts.channels.slack")}</Badge>
                      <Badge variant="outline">{t("adminNotifications.alerts.channels.sms")}</Badge>
                      <Badge variant="outline">{t("adminNotifications.alerts.channels.discord")}</Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 border rounded-lg bg-orange-500/10 border-orange-500/30" data-testid="alert-severity-high">
                    <AlertTriangle className="h-6 w-6 text-orange-500" />
                    <div className="flex-1">
                      <p className="font-medium text-orange-500">{t("adminNotifications.alerts.high")}</p>
                      <p className="text-sm text-muted-foreground">{t("adminNotifications.alerts.highDesc")}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline">{t("adminNotifications.alerts.channels.email")}</Badge>
                      <Badge variant="outline">{t("adminNotifications.alerts.channels.slack")}</Badge>
                      <Badge variant="outline">{t("adminNotifications.alerts.channels.discord")}</Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 border rounded-lg bg-yellow-500/10 border-yellow-500/30" data-testid="alert-severity-medium">
                    <Info className="h-6 w-6 text-yellow-500" />
                    <div className="flex-1">
                      <p className="font-medium text-yellow-500">{t("adminNotifications.alerts.medium")}</p>
                      <p className="text-sm text-muted-foreground">{t("adminNotifications.alerts.mediumDesc")}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline">{t("adminNotifications.alerts.channels.email")}</Badge>
                      <Badge variant="outline">{t("adminNotifications.alerts.channels.slack")}</Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 border rounded-lg bg-blue-500/10 border-blue-500/30" data-testid="alert-severity-low">
                    <CheckCircle className="h-6 w-6 text-blue-500" />
                    <div className="flex-1">
                      <p className="font-medium text-blue-500">{t("adminNotifications.alerts.low")}</p>
                      <p className="text-sm text-muted-foreground">{t("adminNotifications.alerts.lowDesc")}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline">{t("adminNotifications.alerts.channels.slack")}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4" data-testid="content-schedule">
            <Card>
              <CardHeader>
                <CardTitle>{t("adminNotifications.schedule.title")}</CardTitle>
                <CardDescription>{t("adminNotifications.schedule.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t("adminNotifications.schedule.quietHours")}</p>
                    <p className="text-sm text-muted-foreground">{t("adminNotifications.schedule.quietHoursDesc")}</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-quiet-hours" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label data-testid="label-quiet-hours-start">{t("adminNotifications.schedule.quietHoursStart")}</Label>
                    <Select defaultValue="22:00">
                      <SelectTrigger data-testid="select-quiet-hours-start">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                            {`${i.toString().padStart(2, '0')}:00`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label data-testid="label-quiet-hours-end">{t("adminNotifications.schedule.quietHoursEnd")}</Label>
                    <Select defaultValue="08:00">
                      <SelectTrigger data-testid="select-quiet-hours-end">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                            {`${i.toString().padStart(2, '0')}:00`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label data-testid="label-timezone">{t("adminNotifications.schedule.timezone")}</Label>
                  <Select defaultValue="UTC">
                    <SelectTrigger data-testid="select-timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">EST (UTC-5)</SelectItem>
                      <SelectItem value="PST">PST (UTC-8)</SelectItem>
                      <SelectItem value="KST">KST (UTC+9)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t("adminNotifications.schedule.weekendNotifications")}</p>
                    <p className="text-sm text-muted-foreground">{t("adminNotifications.schedule.weekendNotificationsDesc")}</p>
                  </div>
                  <Switch data-testid="switch-weekend-notifications" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4" data-testid="content-preferences">
            <Card>
              <CardHeader>
                <CardTitle>{t("adminNotifications.preferences.title")}</CardTitle>
                <CardDescription>{t("adminNotifications.preferences.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                    <div>
                      <p className="font-medium">{t("adminNotifications.preferences.soundNotifications")}</p>
                      <p className="text-sm text-muted-foreground">{t("adminNotifications.preferences.soundNotificationsDesc")}</p>
                    </div>
                  </div>
                  <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} data-testid="switch-sound-notifications" />
                </div>

                {soundEnabled && (
                  <div className="space-y-2 pl-8">
                    <Label>{t("adminNotifications.preferences.notificationVolume")}</Label>
                    <Slider
                      value={notificationVolume}
                      onValueChange={setNotificationVolume}
                      max={100}
                      step={1}
                      data-testid="slider-volume"
                    />
                    <p className="text-xs text-muted-foreground">{notificationVolume[0]}%</p>
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t("adminNotifications.preferences.desktopNotifications")}</p>
                    <p className="text-sm text-muted-foreground">{t("adminNotifications.preferences.desktopNotificationsDesc")}</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-desktop-notifications" />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t("adminNotifications.preferences.emailDigest")}</p>
                    <p className="text-sm text-muted-foreground">{t("adminNotifications.preferences.emailDigestDesc")}</p>
                  </div>
                  <Switch data-testid="switch-email-digest" />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t("adminNotifications.preferences.duplicateSuppression")}</p>
                    <p className="text-sm text-muted-foreground">{t("adminNotifications.preferences.duplicateSuppressionDesc")}</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-duplicate-suppression" />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label data-testid="label-batch-window">{t("adminNotifications.preferences.alertBatchWindow")}</Label>
                  <Select defaultValue="5">
                    <SelectTrigger data-testid="select-batch-window">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">{t("adminNotifications.preferences.batchImmediate")}</SelectItem>
                      <SelectItem value="1">{t("adminNotifications.preferences.batch1min")}</SelectItem>
                      <SelectItem value="5">{t("adminNotifications.preferences.batch5min")}</SelectItem>
                      <SelectItem value="15">{t("adminNotifications.preferences.batch15min")}</SelectItem>
                      <SelectItem value="30">{t("adminNotifications.preferences.batch30min")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{t("adminNotifications.preferences.alertBatchWindowDesc")}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {selectedChannel && (
        <DetailSheet
          open={showDetailSheet}
          onOpenChange={setShowDetailSheet}
          title={selectedChannel.name}
          sections={getChannelDetailSections(selectedChannel)}
        />
      )}

      <ConfirmationDialog
        open={showSaveConfirmDialog}
        onOpenChange={setShowSaveConfirmDialog}
        title={t("adminNotifications.confirm.saveTitle")}
        description={t("adminNotifications.confirm.saveDescription")}
        confirmText={t("adminNotifications.confirm.saveConfirm")}
        cancelText={t("common.cancel")}
        onConfirm={() => saveSettingsMutation.mutate({})}
        isLoading={saveSettingsMutation.isPending}
        destructive={false}
      />

      <ConfirmationDialog
        open={showTestConfirmDialog}
        onOpenChange={setShowTestConfirmDialog}
        title={t("adminNotifications.confirm.testTitle")}
        description={t("adminNotifications.confirm.testDescription")}
        confirmText={t("adminNotifications.confirm.testConfirm")}
        cancelText={t("common.cancel")}
        onConfirm={() => testNotificationMutation.mutate()}
        isLoading={testNotificationMutation.isPending}
        destructive={false}
      />
    </div>
  );
}
