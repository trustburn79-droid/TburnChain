import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { DetailSheet, type DetailSection } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import {
  LayoutDashboard,
  Plus,
  Save,
  Settings,
  Trash2,
  Copy,
  Edit,
  Eye,
  ChartLine,
  ChartBar,
  ChartPie,
  Gauge,
  Table2,
  AlertTriangle,
  Clock,
  Move,
  Maximize2,
  RefreshCw,
  Download,
  Upload,
  Share2,
  Lock,
  Globe,
  AlertCircle,
} from "lucide-react";

interface Widget {
  id: string;
  type: "chart" | "gauge" | "table" | "alert" | "metric" | "map";
  title: string;
  width: number;
  height: number;
  x: number;
  y: number;
  config: Record<string, unknown>;
}

interface Dashboard {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  isPublic: boolean;
  widgets: Widget[];
  createdAt: string;
  updatedAt: string;
  owner: string;
}

interface DashboardsData {
  dashboards: Dashboard[];
  totalCount: number;
}

export default function DashboardBuilder() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedDashboard, setSelectedDashboard] = useState<string>("main");
  const [isEditing, setIsEditing] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newDashboard, setNewDashboard] = useState({
    name: "",
    description: "",
    isPublic: true,
  });
  const [showDashboardDetail, setShowDashboardDetail] = useState(false);
  const [detailDashboard, setDetailDashboard] = useState<Dashboard | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [showExportConfirm, setShowExportConfirm] = useState(false);

  const { data: dashboardsData, isLoading, error, refetch } = useQuery<DashboardsData>({
    queryKey: ["/api/admin/dashboards"],
  });

  const createDashboardMutation = useMutation({
    mutationFn: async (dashboard: typeof newDashboard) => {
      return apiRequest("POST", "/api/admin/dashboards", dashboard);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboards"] });
      setIsCreateDialogOpen(false);
      setNewDashboard({ name: "", description: "", isPublic: true });
      toast({
        title: t("adminDashboardBuilder.dashboardCreated"),
        description: t("adminDashboardBuilder.dashboardCreatedDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminDashboardBuilder.error"),
        description: t("adminDashboardBuilder.createError"),
        variant: "destructive",
      });
    },
  });

  const updateDashboardMutation = useMutation({
    mutationFn: async ({ id, widgets }: { id: string; widgets: Widget[] }) => {
      return apiRequest("PATCH", `/api/admin/dashboards/${id}`, { widgets });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboards"] });
      setIsEditing(false);
      toast({
        title: t("adminDashboardBuilder.dashboardSaved"),
        description: t("adminDashboardBuilder.dashboardSavedDesc"),
      });
    },
  });

  const deleteDashboardMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/dashboards/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboards"] });
      toast({
        title: t("adminDashboardBuilder.dashboardDeleted"),
        description: t("adminDashboardBuilder.dashboardDeletedDesc"),
      });
    },
  });

  const handleRefresh = useCallback(() => {
    refetch();
    toast({
      title: t("adminDashboardBuilder.refreshed"),
      description: t("adminDashboardBuilder.refreshedDesc"),
    });
  }, [refetch, toast, t]);

  const performExport = useCallback(() => {
    setShowExportConfirm(false);
    const currentDash = dashboards.find(d => d.id === selectedDashboard);
    if (currentDash) {
      const exportData = {
        ...currentDash,
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dashboard-${currentDash.name.toLowerCase().replace(/\s+/g, "-")}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: t("adminDashboardBuilder.exported"),
        description: t("adminDashboardBuilder.exportedDesc"),
      });
    }
  }, [selectedDashboard, toast, t]);

  const confirmDelete = useCallback(() => {
    if (pendingDeleteId) {
      deleteDashboardMutation.mutate(pendingDeleteId);
      setShowDeleteConfirm(false);
      setPendingDeleteId(null);
    }
  }, [pendingDeleteId, deleteDashboardMutation]);

  const getDashboardDetailSections = (dashboard: Dashboard): DetailSection[] => [
    {
      title: t("adminDashboardBuilder.detail.dashboardInfo"),
      fields: [
        { label: t("common.name"), value: dashboard.name },
        { label: t("common.description"), value: dashboard.description },
        { label: t("adminDashboardBuilder.owner"), value: dashboard.owner },
        { 
          label: t("adminDashboardBuilder.public"), 
          value: dashboard.isPublic ? t("common.yes") : t("common.no"), 
          type: "badge" as const,
          badgeVariant: dashboard.isPublic ? "default" : "secondary"
        },
        { 
          label: t("adminDashboardBuilder.default"), 
          value: dashboard.isDefault ? t("common.yes") : t("common.no"), 
          type: "badge" as const,
          badgeVariant: dashboard.isDefault ? "default" : "secondary"
        },
      ],
    },
    {
      title: t("adminDashboardBuilder.detail.metadata"),
      fields: [
        { label: t("common.date"), value: dashboard.createdAt, type: "date" as const },
        { label: t("adminDashboardBuilder.updated"), value: dashboard.updatedAt, type: "date" as const },
        { label: t("adminDashboardBuilder.metrics.widgets"), value: dashboard.widgets.length },
      ],
    },
  ];

  const dashboards: Dashboard[] = dashboardsData?.dashboards || [
    {
      id: "main",
      name: t("adminDashboardBuilder.dashboards.main"),
      description: t("adminDashboardBuilder.dashboards.mainDesc"),
      isDefault: true,
      isPublic: true,
      widgets: [],
      createdAt: "2024-11-01",
      updatedAt: "2024-12-03",
      owner: "admin",
    },
    {
      id: "performance",
      name: t("adminDashboardBuilder.dashboards.performance"),
      description: t("adminDashboardBuilder.dashboards.performanceDesc"),
      isDefault: false,
      isPublic: true,
      widgets: [],
      createdAt: "2024-11-15",
      updatedAt: "2024-12-02",
      owner: "admin",
    },
    {
      id: "security",
      name: t("adminDashboardBuilder.dashboards.security"),
      description: t("adminDashboardBuilder.dashboards.securityDesc"),
      isDefault: false,
      isPublic: false,
      widgets: [],
      createdAt: "2024-11-20",
      updatedAt: "2024-12-01",
      owner: "security-team",
    },
    {
      id: "bridge",
      name: t("adminDashboardBuilder.dashboards.bridge"),
      description: t("adminDashboardBuilder.dashboards.bridgeDesc"),
      isDefault: false,
      isPublic: true,
      widgets: [],
      createdAt: "2024-11-25",
      updatedAt: "2024-12-03",
      owner: "admin",
    },
  ];

  const widgetTypes = [
    { type: "chart", icon: ChartLine, label: t("adminDashboardBuilder.widgets.lineChart"), description: t("adminDashboardBuilder.widgets.lineChartDesc") },
    { type: "bar", icon: ChartBar, label: t("adminDashboardBuilder.widgets.barChart"), description: t("adminDashboardBuilder.widgets.barChartDesc") },
    { type: "pie", icon: ChartPie, label: t("adminDashboardBuilder.widgets.pieChart"), description: t("adminDashboardBuilder.widgets.pieChartDesc") },
    { type: "gauge", icon: Gauge, label: t("adminDashboardBuilder.widgets.gauge"), description: t("adminDashboardBuilder.widgets.gaugeDesc") },
    { type: "table", icon: Table2, label: t("adminDashboardBuilder.widgets.dataTable"), description: t("adminDashboardBuilder.widgets.dataTableDesc") },
    { type: "alert", icon: AlertTriangle, label: t("adminDashboardBuilder.widgets.alertList"), description: t("adminDashboardBuilder.widgets.alertListDesc") },
  ];

  const previewWidgets = [
    { id: "1", type: "metric", title: t("adminDashboardBuilder.preview.currentTps"), x: 0, y: 0, width: 3, height: 1 },
    { id: "2", type: "metric", title: t("adminDashboardBuilder.preview.blockHeight"), x: 3, y: 0, width: 3, height: 1 },
    { id: "3", type: "metric", title: t("adminDashboardBuilder.preview.activeValidators"), x: 6, y: 0, width: 3, height: 1 },
    { id: "4", type: "metric", title: t("adminDashboardBuilder.preview.networkPeers"), x: 9, y: 0, width: 3, height: 1 },
    { id: "5", type: "chart", title: t("adminDashboardBuilder.preview.tpsOverTime"), x: 0, y: 1, width: 6, height: 2 },
    { id: "6", type: "chart", title: t("adminDashboardBuilder.preview.latencyDist"), x: 6, y: 1, width: 6, height: 2 },
    { id: "7", type: "table", title: t("adminDashboardBuilder.preview.recentBlocks"), x: 0, y: 3, width: 6, height: 2 },
    { id: "8", type: "alert", title: t("adminDashboardBuilder.preview.activeAlerts"), x: 6, y: 3, width: 6, height: 2 },
  ];

  const currentDashboard = dashboards.find(d => d.id === selectedDashboard);

  if (error) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="container max-w-[1800px] mx-auto p-6">
          <Card className="border-destructive">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <div className="flex-1">
                  <h3 className="font-semibold">{t("adminDashboardBuilder.errorTitle")}</h3>
                  <p className="text-sm text-muted-foreground">{t("adminDashboardBuilder.errorDescription")}</p>
                </div>
                <Button onClick={() => refetch()} data-testid="button-retry-dashboards">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t("adminDashboardBuilder.retry")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-36" />
            </div>
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
          </Card>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="lg:col-span-4">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-96 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" data-testid="dashboard-builder-page">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-dashboard-builder-title">
              <LayoutDashboard className="h-8 w-8" />
              {t("adminDashboardBuilder.title")}
            </h1>
            <p className="text-muted-foreground" data-testid="text-dashboard-builder-description">
              {t("adminDashboardBuilder.description")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)} data-testid="button-cancel-edit">
                  {t("adminDashboardBuilder.cancel")}
                </Button>
                <Button 
                  onClick={() => updateDashboardMutation.mutate({ id: selectedDashboard, widgets: [] })}
                  disabled={updateDashboardMutation.isPending}
                  data-testid="button-save-dashboard"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {t("adminDashboardBuilder.save")}
                </Button>
              </>
            ) : (
              <>
                <Select value={selectedDashboard} onValueChange={setSelectedDashboard}>
                  <SelectTrigger className="w-48" data-testid="select-dashboard">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dashboards.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        <div className="flex items-center gap-2">
                          {d.name}
                          {d.isDefault && <Badge variant="secondary" className="text-xs">{t("adminDashboardBuilder.default")}</Badge>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={handleRefresh} data-testid="button-refresh-dashboards">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t("adminDashboardBuilder.refresh")}
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(true)} data-testid="button-edit-dashboard">
                  <Edit className="h-4 w-4 mr-2" />
                  {t("adminDashboardBuilder.edit")}
                </Button>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-new-dashboard">
                      <Plus className="h-4 w-4 mr-2" />
                      {t("adminDashboardBuilder.newDashboard")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("adminDashboardBuilder.dialog.createTitle")}</DialogTitle>
                      <DialogDescription>{t("adminDashboardBuilder.dialog.createDescription")}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="dashboard-name">{t("adminDashboardBuilder.dialog.name")}</Label>
                        <Input 
                          id="dashboard-name" 
                          placeholder={t("adminDashboardBuilder.dialog.namePlaceholder")}
                          value={newDashboard.name}
                          onChange={(e) => setNewDashboard({ ...newDashboard, name: e.target.value })}
                          data-testid="input-dashboard-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dashboard-description">{t("adminDashboardBuilder.dialog.description")}</Label>
                        <Input 
                          id="dashboard-description" 
                          placeholder={t("adminDashboardBuilder.dialog.descriptionPlaceholder")}
                          value={newDashboard.description}
                          onChange={(e) => setNewDashboard({ ...newDashboard, description: e.target.value })}
                          data-testid="input-dashboard-description"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <Label>{t("adminDashboardBuilder.dialog.public")}</Label>
                        </div>
                        <Button 
                          variant={newDashboard.isPublic ? "default" : "outline"}
                          size="sm"
                          onClick={() => setNewDashboard({ ...newDashboard, isPublic: !newDashboard.isPublic })}
                          data-testid="button-toggle-public"
                        >
                          {newDashboard.isPublic ? t("adminDashboardBuilder.yes") : t("adminDashboardBuilder.no")}
                        </Button>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} data-testid="button-cancel-create">
                        {t("adminDashboardBuilder.dialog.cancel")}
                      </Button>
                      <Button 
                        onClick={() => createDashboardMutation.mutate(newDashboard)}
                        disabled={createDashboardMutation.isPending}
                        data-testid="button-confirm-create"
                      >
                        {t("adminDashboardBuilder.dialog.create")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>

        {currentDashboard && (
          <Card data-testid="card-current-dashboard">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {currentDashboard.name}
                    {currentDashboard.isDefault && <Badge variant="secondary">{t("adminDashboardBuilder.default")}</Badge>}
                    {currentDashboard.isPublic ? (
                      <Badge variant="outline" className="gap-1">
                        <Globe className="h-3 w-3" />
                        {t("adminDashboardBuilder.public")}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <Lock className="h-3 w-3" />
                        {t("adminDashboardBuilder.private")}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{currentDashboard.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {t("adminDashboardBuilder.updated")} {new Date(currentDashboard.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {isEditing && (
            <Card className="lg:col-span-1" data-testid="card-widget-library">
              <CardHeader>
                <CardTitle className="text-lg">{t("adminDashboardBuilder.widgetLibrary.title")}</CardTitle>
                <CardDescription>{t("adminDashboardBuilder.widgetLibrary.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {widgetTypes.map((widget, index) => (
                      <div
                        key={widget.type}
                        className="p-3 border rounded-lg cursor-move hover-elevate"
                        draggable
                        data-testid={`widget-type-${index}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <widget.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{widget.label}</p>
                            <p className="text-xs text-muted-foreground">{widget.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          <Card className={isEditing ? "lg:col-span-3" : "lg:col-span-4"} data-testid="card-dashboard-preview">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t("adminDashboardBuilder.preview.title")}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={handleRefresh} data-testid="button-refresh-preview">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" data-testid="button-fullscreen">
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-12 gap-4 min-h-[600px] p-4 border-2 border-dashed rounded-lg">
                {previewWidgets.map((widget, index) => (
                  <div
                    key={widget.id}
                    className={`col-span-${widget.width} row-span-${widget.height} p-4 bg-muted rounded-lg border relative group`}
                    style={{
                      gridColumn: `span ${widget.width}`,
                    }}
                    data-testid={`preview-widget-${index}`}
                  >
                    {isEditing && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" data-testid={`button-move-widget-${index}`}>
                          <Move className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" data-testid={`button-settings-widget-${index}`}>
                          <Settings className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" data-testid={`button-delete-widget-${index}`}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    <div className="flex flex-col h-full">
                      <span className="text-sm font-medium mb-2">{widget.title}</span>
                      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                        {widget.type === "metric" && (
                          <span className="text-2xl font-bold text-foreground">
                            {widget.title === t("adminDashboardBuilder.preview.currentTps") ? "485,000" :
                             widget.title === t("adminDashboardBuilder.preview.blockHeight") ? "12,847,563" :
                             widget.title === t("adminDashboardBuilder.preview.activeValidators") ? "156" : "324"}
                          </span>
                        )}
                        {widget.type === "chart" && (
                          <div className="w-full h-full min-h-[100px] bg-muted-foreground/10 rounded flex items-center justify-center">
                            <ChartLine className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        {widget.type === "table" && (
                          <div className="w-full h-full min-h-[100px] bg-muted-foreground/10 rounded flex items-center justify-center">
                            <Table2 className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        {widget.type === "alert" && (
                          <div className="w-full h-full min-h-[100px] bg-muted-foreground/10 rounded flex items-center justify-center">
                            <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card data-testid="card-all-dashboards">
          <CardHeader>
            <CardTitle>{t("adminDashboardBuilder.allDashboards.title")}</CardTitle>
            <CardDescription>{t("adminDashboardBuilder.allDashboards.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {dashboards.map((dashboard, index) => (
                <div
                  key={dashboard.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedDashboard === dashboard.id ? "border-primary bg-primary/5" : "hover-elevate"
                  }`}
                  onClick={() => setSelectedDashboard(dashboard.id)}
                  data-testid={`dashboard-card-${index}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <LayoutDashboard className="h-5 w-5" />
                      <span className="font-medium">{dashboard.name}</span>
                    </div>
                    <div className="flex gap-1">
                      {dashboard.isDefault && (
                        <Badge variant="secondary" className="text-xs">{t("adminDashboardBuilder.default")}</Badge>
                      )}
                      {dashboard.isPublic ? (
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{dashboard.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t("adminDashboardBuilder.owner")}: {dashboard.owner}</span>
                    <span>{new Date(dashboard.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-1 mt-3">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex-1" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setDetailDashboard(dashboard);
                        setShowDashboardDetail(true);
                      }}
                      data-testid={`button-view-dashboard-${index}`}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      {t("adminDashboardBuilder.view")}
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1" data-testid={`button-clone-dashboard-${index}`}>
                      <Copy className="h-3 w-3 mr-1" />
                      {t("adminDashboardBuilder.clone")}
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1" data-testid={`button-share-dashboard-${index}`}>
                      <Share2 className="h-3 w-3 mr-1" />
                      {t("adminDashboardBuilder.share")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card data-testid="card-import-dashboard">
            <CardHeader>
              <CardTitle>{t("adminDashboardBuilder.import.title")}</CardTitle>
              <CardDescription>{t("adminDashboardBuilder.import.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  {t("adminDashboardBuilder.import.dropzone")}
                </p>
                <Button variant="outline" data-testid="button-import-dashboard">
                  <Upload className="h-4 w-4 mr-2" />
                  {t("adminDashboardBuilder.import.browse")}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-export-dashboard">
            <CardHeader>
              <CardTitle>{t("adminDashboardBuilder.export.title")}</CardTitle>
              <CardDescription>{t("adminDashboardBuilder.export.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t("adminDashboardBuilder.export.info")}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowExportConfirm(true)} data-testid="button-export-json">
                  <Download className="h-4 w-4 mr-2" />
                  {t("adminDashboardBuilder.export.json")}
                </Button>
                <Button variant="outline" className="flex-1" data-testid="button-export-png">
                  <Download className="h-4 w-4 mr-2" />
                  {t("adminDashboardBuilder.export.png")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {detailDashboard && (
        <DetailSheet
          open={showDashboardDetail}
          onOpenChange={setShowDashboardDetail}
          title={detailDashboard.name}
          description={detailDashboard.description}
          sections={getDashboardDetailSections(detailDashboard)}
        />
      )}

      <ConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title={t("adminDashboardBuilder.confirm.deleteTitle")}
        description={t("adminDashboardBuilder.confirm.deleteDesc")}
        confirmLabel={t("adminDashboardBuilder.delete")}
        cancelLabel={t("adminDashboardBuilder.cancel")}
        onConfirm={confirmDelete}
        destructive={true}
      />

      <ConfirmationDialog
        open={showExportConfirm}
        onOpenChange={setShowExportConfirm}
        title={t("adminDashboardBuilder.confirm.exportTitle")}
        description={t("adminDashboardBuilder.confirm.exportDesc")}
        confirmLabel={t("adminDashboardBuilder.export")}
        cancelLabel={t("adminDashboardBuilder.cancel")}
        onConfirm={performExport}
        destructive={false}
      />
    </div>
  );
}
