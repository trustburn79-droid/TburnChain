import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Bell,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Send,
  Clock,
  CheckCircle,
  Users,
  Calendar,
  AlertTriangle,
  Megaphone,
  Pin,
  Archive,
  Mail,
  MessageSquare,
  RefreshCw,
  Download,
  AlertCircle,
} from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: "info" | "warning" | "critical" | "maintenance";
  audience: string[];
  status: "draft" | "scheduled" | "published" | "archived";
  pinned: boolean;
  publishedAt: string | null;
  scheduledFor: string | null;
  author: string;
  views: number;
}

interface AnnouncementData {
  announcements: Announcement[];
}

export default function AnnouncementsManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    type: "info",
    audience: "all",
    pinned: false,
    sendEmail: false,
    scheduledFor: "",
  });

  const { data: announcementData, isLoading, error, refetch } = useQuery<AnnouncementData>({
    queryKey: ["/api/admin/announcements"],
  });

  const createMutation = useMutation({
    mutationFn: async (announcement: typeof newAnnouncement) => {
      return apiRequest("POST", "/api/admin/announcements", announcement);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
      setIsCreateDialogOpen(false);
      setNewAnnouncement({ title: "", content: "", type: "info", audience: "all", pinned: false, sendEmail: false, scheduledFor: "" });
      toast({
        title: t("adminAnnouncements.created"),
        description: t("adminAnnouncements.createdDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminAnnouncements.error"),
        description: t("adminAnnouncements.createError"),
        variant: "destructive",
      });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/admin/announcements/${id}/publish`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
      toast({
        title: t("adminAnnouncements.published"),
        description: t("adminAnnouncements.publishedDesc"),
      });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/admin/announcements/${id}/archive`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
      toast({
        title: t("adminAnnouncements.archived"),
        description: t("adminAnnouncements.archivedDesc"),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/announcements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
      toast({
        title: t("adminAnnouncements.deleted"),
        description: t("adminAnnouncements.deletedDesc"),
      });
    },
  });

  const togglePinMutation = useMutation({
    mutationFn: async ({ id, pinned }: { id: string; pinned: boolean }) => {
      return apiRequest("PATCH", `/api/admin/announcements/${id}`, { pinned });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
      toast({
        title: t("adminAnnouncements.updated"),
        description: t("adminAnnouncements.updatedDesc"),
      });
    },
  });

  const handleRefresh = useCallback(() => {
    refetch();
    toast({
      title: t("adminAnnouncements.refreshed"),
      description: t("adminAnnouncements.refreshedDesc"),
    });
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      announcements,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `announcements-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: t("adminAnnouncements.exported"),
      description: t("adminAnnouncements.exportedDesc"),
    });
  }, [toast, t]);

  const announcements: Announcement[] = announcementData?.announcements || [
    {
      id: "ANN-001",
      title: t("adminAnnouncements.samples.maintenance.title"),
      content: t("adminAnnouncements.samples.maintenance.content"),
      type: "maintenance",
      audience: [t("adminAnnouncements.audiences.allUsers")],
      status: "published",
      pinned: true,
      publishedAt: "2024-12-03T10:00:00Z",
      scheduledFor: null,
      author: t("adminAnnouncements.authors.sysAdmin"),
      views: 245
    },
    {
      id: "ANN-002",
      title: t("adminAnnouncements.samples.customDashboards.title"),
      content: t("adminAnnouncements.samples.customDashboards.content"),
      type: "info",
      audience: [t("adminAnnouncements.audiences.allUsers")],
      status: "published",
      pinned: false,
      publishedAt: "2024-12-01T14:30:00Z",
      scheduledFor: null,
      author: t("adminAnnouncements.authors.productTeam"),
      views: 189
    },
    {
      id: "ANN-003",
      title: t("adminAnnouncements.samples.securityAdvisory.title"),
      content: t("adminAnnouncements.samples.securityAdvisory.content"),
      type: "warning",
      audience: [t("adminAnnouncements.audiences.administrators"), t("adminAnnouncements.audiences.securityTeam")],
      status: "published",
      pinned: true,
      publishedAt: "2024-11-28T09:00:00Z",
      scheduledFor: null,
      author: t("adminAnnouncements.authors.securityTeam"),
      views: 156
    },
    {
      id: "ANN-004",
      title: t("adminAnnouncements.samples.apiRateLimit.title"),
      content: t("adminAnnouncements.samples.apiRateLimit.content"),
      type: "info",
      audience: [t("adminAnnouncements.audiences.developers")],
      status: "scheduled",
      pinned: false,
      publishedAt: null,
      scheduledFor: "2024-12-15T09:00:00Z",
      author: t("adminAnnouncements.authors.apiTeam"),
      views: 0
    },
    {
      id: "ANN-005",
      title: t("adminAnnouncements.samples.bridgeIncident.title"),
      content: t("adminAnnouncements.samples.bridgeIncident.content"),
      type: "critical",
      audience: [t("adminAnnouncements.audiences.allUsers")],
      status: "archived",
      pinned: false,
      publishedAt: "2024-11-20T16:00:00Z",
      scheduledFor: null,
      author: t("adminAnnouncements.authors.operations"),
      views: 892
    },
    {
      id: "ANN-006",
      title: t("adminAnnouncements.samples.holidaySupport.title"),
      content: t("adminAnnouncements.samples.holidaySupport.content"),
      type: "info",
      audience: [t("adminAnnouncements.audiences.allUsers")],
      status: "draft",
      pinned: false,
      publishedAt: null,
      scheduledFor: null,
      author: t("adminAnnouncements.authors.supportTeam"),
      views: 0
    },
  ];

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "info": return <Badge className="bg-blue-500">{t("adminAnnouncements.types.info")}</Badge>;
      case "warning": return <Badge className="bg-yellow-500">{t("adminAnnouncements.types.warning")}</Badge>;
      case "critical": return <Badge className="bg-red-500">{t("adminAnnouncements.types.critical")}</Badge>;
      case "maintenance": return <Badge className="bg-purple-500">{t("adminAnnouncements.types.maintenance")}</Badge>;
      default: return <Badge>{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published": return <Badge className="bg-green-500">{t("adminAnnouncements.status.published")}</Badge>;
      case "scheduled": return <Badge variant="secondary">{t("adminAnnouncements.status.scheduled")}</Badge>;
      case "draft": return <Badge variant="outline">{t("adminAnnouncements.status.draft")}</Badge>;
      case "archived": return <Badge variant="outline" className="opacity-50">{t("adminAnnouncements.status.archived")}</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const filteredAnnouncements = announcements.filter((ann) => {
    const matchesSearch = ann.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || ann.type === selectedType;
    const matchesTab = activeTab === "all" || ann.status === activeTab;
    return matchesSearch && matchesType && matchesTab;
  });

  const publishedCount = announcements.filter(a => a.status === "published").length;
  const scheduledCount = announcements.filter(a => a.status === "scheduled").length;
  const draftCount = announcements.filter(a => a.status === "draft").length;
  const totalViews = announcements.reduce((sum, a) => sum + a.views, 0);

  if (error) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="container max-w-[1800px] mx-auto p-6">
          <Card className="border-destructive">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <div className="flex-1">
                  <h3 className="font-semibold">{t("adminAnnouncements.errorTitle")}</h3>
                  <p className="text-sm text-muted-foreground">{t("adminAnnouncements.errorDescription")}</p>
                </div>
                <Button onClick={() => refetch()} data-testid="button-retry-announcements">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t("adminAnnouncements.retry")}
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
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-36" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" data-testid="announcements-page">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-announcements-title">
              <Bell className="h-8 w-8" />
              {t("adminAnnouncements.title")}
            </h1>
            <p className="text-muted-foreground" data-testid="text-announcements-description">
              {t("adminAnnouncements.description")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh} data-testid="button-refresh-announcements">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminAnnouncements.refresh")}
            </Button>
            <Button variant="outline" onClick={handleExport} data-testid="button-export-announcements">
              <Download className="h-4 w-4 mr-2" />
              {t("adminAnnouncements.export")}
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-new-announcement">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("adminAnnouncements.newAnnouncement")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t("adminAnnouncements.dialog.createTitle")}</DialogTitle>
                  <DialogDescription>{t("adminAnnouncements.dialog.createDesc")}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t("adminAnnouncements.dialog.title")}</Label>
                    <Input 
                      placeholder={t("adminAnnouncements.dialog.titlePlaceholder")} 
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                      data-testid="input-announcement-title"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("adminAnnouncements.dialog.type")}</Label>
                      <Select 
                        value={newAnnouncement.type} 
                        onValueChange={(v) => setNewAnnouncement({ ...newAnnouncement, type: v })}
                      >
                        <SelectTrigger data-testid="select-announcement-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">{t("adminAnnouncements.types.info")}</SelectItem>
                          <SelectItem value="warning">{t("adminAnnouncements.types.warning")}</SelectItem>
                          <SelectItem value="critical">{t("adminAnnouncements.types.critical")}</SelectItem>
                          <SelectItem value="maintenance">{t("adminAnnouncements.types.maintenance")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("adminAnnouncements.dialog.audience")}</Label>
                      <Select 
                        value={newAnnouncement.audience}
                        onValueChange={(v) => setNewAnnouncement({ ...newAnnouncement, audience: v })}
                      >
                        <SelectTrigger data-testid="select-announcement-audience">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t("adminAnnouncements.audiences.allUsers")}</SelectItem>
                          <SelectItem value="admins">{t("adminAnnouncements.audiences.administrators")}</SelectItem>
                          <SelectItem value="developers">{t("adminAnnouncements.audiences.developers")}</SelectItem>
                          <SelectItem value="security">{t("adminAnnouncements.audiences.securityTeam")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adminAnnouncements.dialog.content")}</Label>
                    <Textarea 
                      placeholder={t("adminAnnouncements.dialog.contentPlaceholder")} 
                      rows={5}
                      value={newAnnouncement.content}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                      data-testid="input-announcement-content"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch 
                        id="pin-announcement" 
                        checked={newAnnouncement.pinned}
                        onCheckedChange={(checked) => setNewAnnouncement({ ...newAnnouncement, pinned: checked })}
                        data-testid="switch-pin"
                      />
                      <Label htmlFor="pin-announcement">{t("adminAnnouncements.dialog.pinToTop")}</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        id="notify-email" 
                        checked={newAnnouncement.sendEmail}
                        onCheckedChange={(checked) => setNewAnnouncement({ ...newAnnouncement, sendEmail: checked })}
                        data-testid="switch-email"
                      />
                      <Label htmlFor="notify-email">{t("adminAnnouncements.dialog.sendEmail")}</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adminAnnouncements.dialog.schedule")}</Label>
                    <Input 
                      type="datetime-local" 
                      value={newAnnouncement.scheduledFor}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, scheduledFor: e.target.value })}
                      data-testid="input-schedule"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => createMutation.mutate({ ...newAnnouncement, status: "draft" } as any)}
                    disabled={createMutation.isPending}
                    data-testid="button-save-draft"
                  >
                    {t("adminAnnouncements.dialog.saveDraft")}
                  </Button>
                  <Button 
                    onClick={() => createMutation.mutate(newAnnouncement)}
                    disabled={createMutation.isPending || !newAnnouncement.title || !newAnnouncement.content}
                    data-testid="button-publish-announcement"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {t("adminAnnouncements.dialog.publish")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card data-testid="card-published">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminAnnouncements.stats.published")}</p>
                  <p className="text-2xl font-bold" data-testid="text-published-count">{publishedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-scheduled">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminAnnouncements.stats.scheduled")}</p>
                  <p className="text-2xl font-bold" data-testid="text-scheduled-count">{scheduledCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-drafts">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Edit className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminAnnouncements.stats.drafts")}</p>
                  <p className="text-2xl font-bold" data-testid="text-drafts-count">{draftCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-views">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Eye className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminAnnouncements.stats.totalViews")}</p>
                  <p className="text-2xl font-bold" data-testid="text-total-views">{totalViews}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card data-testid="card-announcements-list">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList data-testid="tabs-announcements">
                  <TabsTrigger value="all" data-testid="tab-all">{t("adminAnnouncements.tabs.all")}</TabsTrigger>
                  <TabsTrigger value="published" data-testid="tab-published">{t("adminAnnouncements.tabs.published")}</TabsTrigger>
                  <TabsTrigger value="scheduled" data-testid="tab-scheduled">{t("adminAnnouncements.tabs.scheduled")}</TabsTrigger>
                  <TabsTrigger value="draft" data-testid="tab-draft">{t("adminAnnouncements.tabs.drafts")}</TabsTrigger>
                  <TabsTrigger value="archived" data-testid="tab-archived">{t("adminAnnouncements.tabs.archived")}</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("adminAnnouncements.searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-announcements"
                  />
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-32" data-testid="select-filter-type">
                    <SelectValue placeholder={t("adminAnnouncements.type")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("adminAnnouncements.filters.allTypes")}</SelectItem>
                    <SelectItem value="info">{t("adminAnnouncements.types.info")}</SelectItem>
                    <SelectItem value="warning">{t("adminAnnouncements.types.warning")}</SelectItem>
                    <SelectItem value="critical">{t("adminAnnouncements.types.critical")}</SelectItem>
                    <SelectItem value="maintenance">{t("adminAnnouncements.types.maintenance")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>{t("adminAnnouncements.table.title")}</TableHead>
                  <TableHead>{t("adminAnnouncements.table.type")}</TableHead>
                  <TableHead>{t("adminAnnouncements.table.audience")}</TableHead>
                  <TableHead>{t("adminAnnouncements.table.author")}</TableHead>
                  <TableHead>{t("adminAnnouncements.table.status")}</TableHead>
                  <TableHead>{t("adminAnnouncements.table.date")}</TableHead>
                  <TableHead>{t("adminAnnouncements.table.views")}</TableHead>
                  <TableHead className="text-right">{t("adminAnnouncements.table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnnouncements.map((ann, index) => (
                  <TableRow key={ann.id} data-testid={`announcement-row-${index}`}>
                    <TableCell>
                      {ann.pinned && <Pin className="h-4 w-4 text-primary" />}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{ann.title}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-xs">{ann.content}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(ann.type)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {ann.audience.map((a) => (
                          <Badge key={a} variant="outline" className="text-xs">{a}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{ann.author}</TableCell>
                    <TableCell>{getStatusBadge(ann.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {ann.status === "scheduled" && ann.scheduledFor
                        ? new Date(ann.scheduledFor).toLocaleDateString()
                        : ann.publishedAt
                        ? new Date(ann.publishedAt).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>{ann.views}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" data-testid={`button-view-${index}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" data-testid={`button-edit-${index}`}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {ann.status === "scheduled" && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => publishMutation.mutate(ann.id)}
                            data-testid={`button-publish-${index}`}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        {ann.status !== "archived" && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => archiveMutation.mutate(ann.id)}
                            data-testid={`button-archive-${index}`}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive"
                          onClick={() => deleteMutation.mutate(ann.id)}
                          data-testid={`button-delete-${index}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card data-testid="card-pinned-announcements">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pin className="h-5 w-5" />
                {t("adminAnnouncements.pinnedAnnouncements")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.filter(a => a.pinned && a.status === "published").map((ann, index) => (
                  <div key={ann.id} className="p-4 border rounded-lg" data-testid={`pinned-item-${index}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          {getTypeBadge(ann.type)}
                          <span className="font-medium">{ann.title}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{ann.content}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => togglePinMutation.mutate({ id: ann.id, pinned: false })}
                        data-testid={`button-unpin-${index}`}
                      >
                        <Pin className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {announcements.filter(a => a.pinned && a.status === "published").length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">{t("adminAnnouncements.noPinned")}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-upcoming-scheduled">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {t("adminAnnouncements.upcomingScheduled")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.filter(a => a.status === "scheduled").map((ann, index) => (
                  <div key={ann.id} className="p-4 border rounded-lg" data-testid={`scheduled-item-${index}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          {getTypeBadge(ann.type)}
                          <span className="font-medium">{ann.title}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t("adminAnnouncements.scheduledFor")}: {ann.scheduledFor && new Date(ann.scheduledFor).toLocaleString()}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => publishMutation.mutate(ann.id)}
                        data-testid={`button-publish-now-${index}`}
                      >
                        <Send className="h-3 w-3 mr-1" />
                        {t("adminAnnouncements.publishNow")}
                      </Button>
                    </div>
                  </div>
                ))}
                {announcements.filter(a => a.status === "scheduled").length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">{t("adminAnnouncements.noScheduled")}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
