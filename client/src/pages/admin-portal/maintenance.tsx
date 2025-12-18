import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { DetailSheet, type DetailSection } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { 
  Wrench, Clock, Calendar, AlertTriangle, 
  CheckCircle, Play, Pause, Settings, RefreshCw, AlertCircle as AlertCircleIcon, Loader2, Eye
} from "lucide-react";

interface MaintenanceWindow {
  id: number;
  name: string;
  start: string;
  end: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  type: "update" | "maintenance" | "security";
}

interface PastMaintenance {
  id: number;
  name: string;
  date: string;
  duration: string;
  status: "completed" | "cancelled";
  impact: string;
}

interface MaintenanceData {
  maintenanceMode: boolean;
  windows: MaintenanceWindow[];
  pastMaintenance: PastMaintenance[];
}

export default function AdminMaintenance() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newWindow, setNewWindow] = useState({
    title: "",
    type: "",
    startTime: "",
    endTime: "",
    description: "",
    notification: "",
  });
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [selectedWindow, setSelectedWindow] = useState<MaintenanceWindow | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [windowToCancel, setWindowToCancel] = useState<MaintenanceWindow | null>(null);
  const [showMaintenanceModeDialog, setShowMaintenanceModeDialog] = useState(false);
  const [pendingMaintenanceMode, setPendingMaintenanceMode] = useState(false);

  const { data: apiResponse, isLoading, error, refetch } = useQuery<{ success: boolean; data: MaintenanceData }>({
    queryKey: ["/api/enterprise/admin/operations/maintenance"],
    refetchInterval: 30000,
    staleTime: 30000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const maintenanceData = apiResponse?.data;

  const toggleMaintenanceModeMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      return apiRequest("POST", "/api/enterprise/admin/operations/maintenance/mode", { enabled });
    },
    onSuccess: (_, enabled) => {
      setShowMaintenanceModeDialog(false);
      toast({
        title: enabled ? t("adminMaintenance.modeEnabled") : t("adminMaintenance.modeDisabled"),
        description: enabled ? t("adminMaintenance.modeEnabledDesc") : t("adminMaintenance.modeDisabledDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/enterprise/admin/operations/maintenance"] });
    },
    onError: () => {
      toast({
        title: t("adminMaintenance.modeError"),
        description: t("adminMaintenance.modeErrorDesc"),
        variant: "destructive",
      });
    },
  });

  const scheduleWindowMutation = useMutation({
    mutationFn: async (data: typeof newWindow) => {
      return apiRequest("POST", "/api/enterprise/admin/operations/maintenance/schedule", data);
    },
    onSuccess: () => {
      toast({
        title: t("adminMaintenance.windowScheduled"),
        description: t("adminMaintenance.windowScheduledDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/enterprise/admin/operations/maintenance"] });
      setNewWindow({ title: "", type: "", startTime: "", endTime: "", description: "", notification: "" });
    },
    onError: () => {
      toast({
        title: t("adminMaintenance.scheduleError"),
        description: t("adminMaintenance.scheduleErrorDesc"),
        variant: "destructive",
      });
    },
  });

  const cancelWindowMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("POST", `/api/enterprise/admin/operations/maintenance/cancel/${id}`);
    },
    onSuccess: () => {
      setShowCancelDialog(false);
      setWindowToCancel(null);
      toast({
        title: t("adminMaintenance.windowCancelled"),
        description: t("adminMaintenance.windowCancelledDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/enterprise/admin/operations/maintenance"] });
    },
  });

  const maintenanceMode = useMemo(() => {
    return maintenanceData?.maintenanceMode ?? false;
  }, [maintenanceData]);

  const maintenanceWindows = useMemo(() => {
    if (maintenanceData?.windows) return maintenanceData.windows;
    return [
      { id: 1, name: "v8.0 Mainnet Launch Preparation", start: "2024-12-08 00:00 UTC", end: "2024-12-08 02:00 UTC", status: "scheduled" as const, type: "update" as const },
      { id: 2, name: "Post-Launch Health Check", start: "2024-12-08 12:00 UTC", end: "2024-12-08 12:30 UTC", status: "scheduled" as const, type: "maintenance" as const },
      { id: 3, name: "Security Audit Post-Launch", start: "2024-12-09 00:00 UTC", end: "2024-12-09 01:00 UTC", status: "scheduled" as const, type: "security" as const },
      { id: 4, name: "Bridge Performance Optimization", start: "2024-12-10 02:00 UTC", end: "2024-12-10 04:00 UTC", status: "scheduled" as const, type: "maintenance" as const },
      { id: 5, name: t("adminMaintenance.databaseOptimization"), start: "2024-12-15 00:00 UTC", end: "2024-12-15 02:00 UTC", status: "scheduled" as const, type: "maintenance" as const },
    ];
  }, [maintenanceData, t]);

  const pastMaintenance = useMemo(() => {
    if (maintenanceData?.pastMaintenance) return maintenanceData.pastMaintenance;
    return [
      { id: 1, name: "v8.0 Final Testnet Validation", date: "2024-12-07", duration: "2h 30m", status: "completed" as const, impact: t("adminMaintenance.none") },
      { id: 2, name: "AI Orchestration System Upgrade", date: "2024-12-06", duration: "45m", status: "completed" as const, impact: t("adminMaintenance.minimal") },
      { id: 3, name: "Cross-chain Bridge Sync", date: "2024-12-05", duration: "1h 15m", status: "completed" as const, impact: t("adminMaintenance.bridgeOnly") },
      { id: 4, name: "Validator Set Expansion", date: "2024-12-03", duration: "30m", status: "completed" as const, impact: t("adminMaintenance.none") },
      { id: 5, name: t("adminMaintenance.v40Release"), date: "2024-12-01", duration: "3h 45m", status: "completed" as const, impact: t("adminMaintenance.minimal") },
      { id: 6, name: "Security Hardening Phase 2", date: "2024-11-28", duration: "2h 00m", status: "completed" as const, impact: t("adminMaintenance.none") },
    ];
  }, [maintenanceData, t]);

  const getWindowDetailSections = useCallback((window: MaintenanceWindow): DetailSection[] => [
    {
      title: t("adminMaintenance.detail.windowInfo"),
      fields: [
        { label: t("adminMaintenance.name"), value: window.name, type: "text" as const },
        { label: t("adminMaintenance.type"), value: window.type.toUpperCase(), type: "badge" as const },
        { label: t("adminMaintenance.status"), value: window.status, type: "badge" as const, badgeVariant: window.status === "completed" ? "default" : "secondary" },
      ],
    },
    {
      title: t("adminMaintenance.detail.schedule"),
      fields: [
        { label: t("adminMaintenance.start"), value: window.start, type: "text" as const },
        { label: t("adminMaintenance.end"), value: window.end, type: "text" as const },
        { label: t("adminMaintenance.detail.estimatedDuration"), value: "2h 00m", type: "text" as const },
      ],
    },
  ], [t]);

  const handleViewWindow = (window: MaintenanceWindow) => {
    setSelectedWindow(window);
    setShowDetailSheet(true);
  };

  const handleCancelWindow = (window: MaintenanceWindow) => {
    setWindowToCancel(window);
    setShowCancelDialog(true);
  };

  const handleMaintenanceModeChange = (checked: boolean) => {
    setPendingMaintenanceMode(checked);
    setShowMaintenanceModeDialog(true);
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: t("adminMaintenance.refreshSuccess"),
        description: t("adminMaintenance.dataUpdated"),
      });
    } catch (error) {
      toast({
        title: t("adminMaintenance.refreshError"),
        description: t("adminMaintenance.refreshErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast, t]);

  const handleScheduleMaintenance = useCallback(() => {
    scheduleWindowMutation.mutate(newWindow);
  }, [scheduleWindowMutation, newWindow]);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center" data-testid="maintenance-error">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircleIcon className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">{t("adminMaintenance.error.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("adminMaintenance.error.description")}</p>
            <Button onClick={() => refetch()} data-testid="button-retry">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminMaintenance.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <ScrollArea className="h-full" data-testid="maintenance-page">
        <div className="p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-page-title">{t("adminMaintenance.title")}</h1>
              <p className="text-muted-foreground" data-testid="text-page-subtitle">{t("adminMaintenance.subtitle")}</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge 
                variant="outline" 
                className={maintenanceMode ? "bg-yellow-500/10 text-yellow-500" : "bg-green-500/10 text-green-500"}
                data-testid="badge-maintenance-status"
              >
                {maintenanceMode ? (
                  <><Wrench className="w-3 h-3 mr-1" /> {t("adminMaintenance.maintenanceActive")}</>
                ) : (
                  <><CheckCircle className="w-3 h-3 mr-1" /> {t("adminMaintenance.normalOperation")}</>
                )}
              </Badge>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing} data-testid="button-refresh">
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("adminMaintenance.refresh")}</TooltipContent>
              </Tooltip>
            </div>
          </div>

          <Card className={maintenanceMode ? "border-yellow-500/30 bg-yellow-500/5" : ""} data-testid="card-quick-toggle">
            <CardHeader>
              <CardTitle>{t("adminMaintenance.quickMaintenanceToggle")}</CardTitle>
              <CardDescription>{t("adminMaintenance.quickMaintenanceToggleDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                <>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{t("adminMaintenance.maintenanceMode")}</p>
                      <p className="text-sm text-muted-foreground">
                        {maintenanceMode ? t("adminMaintenance.systemReadOnly") : t("adminMaintenance.systemFullyOperational")}
                      </p>
                    </div>
                    <Switch 
                      checked={maintenanceMode} 
                      onCheckedChange={handleMaintenanceModeChange}
                      disabled={toggleMaintenanceModeMutation.isPending}
                      data-testid="switch-maintenance-mode"
                    />
                  </div>
                  {maintenanceMode && (
                    <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg" data-testid="maintenance-warning">
                      <div className="flex items-center gap-2 text-yellow-500 mb-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-medium">{t("adminMaintenance.maintenanceModeActive")}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t("adminMaintenance.maintenanceModeActiveDesc")}
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="scheduled" className="space-y-4" data-testid="tabs-maintenance">
            <TabsList data-testid="tabs-list">
              <TabsTrigger value="scheduled" data-testid="tab-scheduled">{t("adminMaintenance.scheduled")}</TabsTrigger>
              <TabsTrigger value="create" data-testid="tab-create">{t("adminMaintenance.scheduleNew")}</TabsTrigger>
              <TabsTrigger value="history" data-testid="tab-history">{t("adminMaintenance.history")}</TabsTrigger>
            </TabsList>

            <TabsContent value="scheduled">
              <Card data-testid="card-upcoming-maintenance">
                <CardHeader>
                  <CardTitle>{t("adminMaintenance.upcomingMaintenance")}</CardTitle>
                  <CardDescription>{t("adminMaintenance.upcomingMaintenanceDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("adminMaintenance.name")}</TableHead>
                          <TableHead>{t("adminMaintenance.start")}</TableHead>
                          <TableHead>{t("adminMaintenance.end")}</TableHead>
                          <TableHead>{t("adminMaintenance.type")}</TableHead>
                          <TableHead>{t("adminMaintenance.status")}</TableHead>
                          <TableHead>{t("adminMaintenance.actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {maintenanceWindows.map((window, index) => (
                          <TableRow key={window.id} data-testid={`window-row-${index}`}>
                            <TableCell className="font-medium" data-testid={`window-name-${index}`}>{window.name}</TableCell>
                            <TableCell data-testid={`window-start-${index}`}>{window.start}</TableCell>
                            <TableCell data-testid={`window-end-${index}`}>{window.end}</TableCell>
                            <TableCell>
                              <Badge variant="outline" data-testid={`window-type-${index}`}>{window.type}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" data-testid={`window-status-${index}`}>
                                <Clock className="w-3 h-3 mr-1" />
                                {window.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" onClick={() => handleViewWindow(window)} data-testid={`button-view-${index}`}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  {t("adminMaintenance.view")}
                                </Button>
                                <Button size="sm" variant="ghost" data-testid={`button-edit-${index}`}>{t("adminMaintenance.edit")}</Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="text-red-500"
                                  onClick={() => handleCancelWindow(window)}
                                  disabled={cancelWindowMutation.isPending}
                                  data-testid={`button-cancel-${index}`}
                                >
                                  {t("adminMaintenance.cancel")}
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

            <TabsContent value="create">
              <Card data-testid="card-schedule-window">
                <CardHeader>
                  <CardTitle>{t("adminMaintenance.scheduleMaintenanceWindow")}</CardTitle>
                  <CardDescription>{t("adminMaintenance.scheduleMaintenanceWindowDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{t("adminMaintenance.titleLabel")}</Label>
                          <Input 
                            placeholder={t("adminMaintenance.titlePlaceholder")} 
                            value={newWindow.title}
                            onChange={(e) => setNewWindow(prev => ({ ...prev, title: e.target.value }))}
                            data-testid="input-title"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t("adminMaintenance.typeLabel")}</Label>
                          <Input 
                            placeholder={t("adminMaintenance.typePlaceholder")}
                            value={newWindow.type}
                            onChange={(e) => setNewWindow(prev => ({ ...prev, type: e.target.value }))}
                            data-testid="input-type"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t("adminMaintenance.startTime")}</Label>
                          <Input 
                            type="datetime-local"
                            value={newWindow.startTime}
                            onChange={(e) => setNewWindow(prev => ({ ...prev, startTime: e.target.value }))}
                            data-testid="input-start-time"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t("adminMaintenance.endTime")}</Label>
                          <Input 
                            type="datetime-local"
                            value={newWindow.endTime}
                            onChange={(e) => setNewWindow(prev => ({ ...prev, endTime: e.target.value }))}
                            data-testid="input-end-time"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>{t("adminMaintenance.description")}</Label>
                        <Textarea 
                          placeholder={t("adminMaintenance.descriptionPlaceholder")}
                          value={newWindow.description}
                          onChange={(e) => setNewWindow(prev => ({ ...prev, description: e.target.value }))}
                          data-testid="textarea-description"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("adminMaintenance.notificationMessage")}</Label>
                        <Textarea 
                          placeholder={t("adminMaintenance.notificationPlaceholder")}
                          value={newWindow.notification}
                          onChange={(e) => setNewWindow(prev => ({ ...prev, notification: e.target.value }))}
                          data-testid="textarea-notification"
                        />
                      </div>
                      <Button 
                        onClick={handleScheduleMaintenance}
                        disabled={scheduleWindowMutation.isPending}
                        data-testid="button-schedule"
                      >
                        {scheduleWindowMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Calendar className="w-4 h-4 mr-2" />
                        )}
                        {t("adminMaintenance.scheduleMaintenance")}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card data-testid="card-past-maintenance">
                <CardHeader>
                  <CardTitle>{t("adminMaintenance.pastMaintenance")}</CardTitle>
                  <CardDescription>{t("adminMaintenance.pastMaintenanceDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("adminMaintenance.name")}</TableHead>
                          <TableHead>{t("adminMaintenance.date")}</TableHead>
                          <TableHead>{t("adminMaintenance.duration")}</TableHead>
                          <TableHead>{t("adminMaintenance.impact")}</TableHead>
                          <TableHead>{t("adminMaintenance.status")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pastMaintenance.map((m, index) => (
                          <TableRow key={m.id} data-testid={`past-row-${index}`}>
                            <TableCell className="font-medium" data-testid={`past-name-${index}`}>{m.name}</TableCell>
                            <TableCell data-testid={`past-date-${index}`}>{m.date}</TableCell>
                            <TableCell data-testid={`past-duration-${index}`}>{m.duration}</TableCell>
                            <TableCell data-testid={`past-impact-${index}`}>{m.impact}</TableCell>
                            <TableCell>
                              <Badge className={m.status === "completed" ? "bg-green-500" : "bg-red-500"} data-testid={`past-status-${index}`}>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {m.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>

      {selectedWindow && (
        <DetailSheet
          open={showDetailSheet}
          onOpenChange={setShowDetailSheet}
          title={selectedWindow.name}
          sections={getWindowDetailSections(selectedWindow)}
        />
      )}

      <ConfirmationDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title={t("adminMaintenance.confirm.cancelTitle")}
        description={t("adminMaintenance.confirm.cancelDescription", { name: windowToCancel?.name })}
        confirmText={t("adminMaintenance.confirm.cancelConfirm")}
        cancelText={t("common.cancel")}
        onConfirm={() => { if (windowToCancel) cancelWindowMutation.mutate(windowToCancel.id); }}
        isLoading={cancelWindowMutation.isPending}
        destructive={true}
      />

      <ConfirmationDialog
        open={showMaintenanceModeDialog}
        onOpenChange={setShowMaintenanceModeDialog}
        title={pendingMaintenanceMode ? t("adminMaintenance.confirm.enableTitle") : t("adminMaintenance.confirm.disableTitle")}
        description={pendingMaintenanceMode ? t("adminMaintenance.confirm.enableDescription") : t("adminMaintenance.confirm.disableDescription")}
        confirmText={pendingMaintenanceMode ? t("adminMaintenance.confirm.enableConfirm") : t("adminMaintenance.confirm.disableConfirm")}
        cancelText={t("common.cancel")}
        onConfirm={() => toggleMaintenanceModeMutation.mutate(pendingMaintenanceMode)}
        isLoading={toggleMaintenanceModeMutation.isPending}
        destructive={pendingMaintenanceMode}
      />
    </TooltipProvider>
  );
}
