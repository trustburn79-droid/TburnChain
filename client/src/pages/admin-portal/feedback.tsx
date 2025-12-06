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
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { DetailSheet, type DetailSection } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Star,
  Search,
  Filter,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Users,
  BarChart3,
  CheckCircle,
  Clock,
  AlertTriangle,
  MessageCircle,
  Smile,
  Meh,
  Frown,
  AlertCircle,
  Send,
  Eye,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, LineChart, Line } from "recharts";

interface FeedbackItem {
  id: string;
  type: "suggestion" | "bug" | "praise" | "complaint";
  category: string;
  message: string;
  rating: number;
  user: string;
  createdAt: string;
  status: "new" | "reviewed" | "actioned" | "archived";
  response: string | null;
}

interface FeedbackData {
  items: FeedbackItem[];
  ratingData: { rating: string; count: number; percentage: number }[];
  typeDistribution: { name: string; value: number; color: string }[];
  trendData: { day: string; feedback: number; avgRating: number }[];
}

export default function FeedbackSystem() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [isRespondDialogOpen, setIsRespondDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [responseText, setResponseText] = useState("");
  const [showFeedbackDetail, setShowFeedbackDetail] = useState(false);
  const [detailFeedback, setDetailFeedback] = useState<FeedbackItem | null>(null);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [pendingArchiveId, setPendingArchiveId] = useState<string | null>(null);

  const { data: feedbackData, isLoading, error, refetch } = useQuery<FeedbackData>({
    queryKey: ["/api/admin/feedback"],
  });

  const respondMutation = useMutation({
    mutationFn: async ({ feedbackId, response }: { feedbackId: string; response: string }) => {
      return apiRequest("POST", `/api/admin/feedback/${feedbackId}/respond`, { response });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/feedback"] });
      setIsRespondDialogOpen(false);
      setResponseText("");
      setSelectedFeedback(null);
      toast({
        title: t("adminFeedback.responseSent"),
        description: t("adminFeedback.responseSentDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminFeedback.error"),
        description: t("adminFeedback.respondError"),
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ feedbackId, status }: { feedbackId: string; status: string }) => {
      return apiRequest("PATCH", `/api/admin/feedback/${feedbackId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/feedback"] });
      toast({
        title: t("adminFeedback.statusUpdated"),
        description: t("adminFeedback.statusUpdatedDesc"),
      });
    },
  });

  const handleRefresh = useCallback(() => {
    refetch();
    toast({
      title: t("adminFeedback.refreshed"),
      description: t("adminFeedback.refreshedDesc"),
    });
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      items: feedbackItems,
      ratingData,
      typeDistribution,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feedback-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: t("adminFeedback.exported"),
      description: t("adminFeedback.exportedDesc"),
    });
  }, [toast, t]);

  const feedbackItems: FeedbackItem[] = feedbackData?.items || [
    { id: "FB-001", type: "suggestion", category: t("adminFeedback.categories.dashboard"), message: t("adminFeedback.sampleMessages.customWidgets"), rating: 4, user: "admin@tburn.io", createdAt: "2024-12-03T10:00:00Z", status: "new", response: null },
    { id: "FB-002", type: "praise", category: t("adminFeedback.categories.performance"), message: t("adminFeedback.sampleMessages.realtimeMonitoring"), rating: 5, user: "ops@tburn.io", createdAt: "2024-12-02T15:30:00Z", status: "reviewed", response: t("adminFeedback.sampleResponses.thanks") },
    { id: "FB-003", type: "bug", category: t("adminFeedback.categories.alerts"), message: t("adminFeedback.sampleMessages.lateNotifications"), rating: 2, user: "security@tburn.io", createdAt: "2024-12-02T09:15:00Z", status: "actioned", response: t("adminFeedback.sampleResponses.fixed") },
    { id: "FB-004", type: "complaint", category: t("adminFeedback.categories.documentation"), message: t("adminFeedback.sampleMessages.outdatedDocs"), rating: 2, user: "dev@tburn.io", createdAt: "2024-12-01T14:00:00Z", status: "actioned", response: t("adminFeedback.sampleResponses.updating") },
    { id: "FB-005", type: "suggestion", category: t("adminFeedback.categories.security"), message: t("adminFeedback.sampleMessages.hardwareKeys"), rating: 4, user: "analyst@tburn.io", createdAt: "2024-11-30T11:20:00Z", status: "reviewed", response: null },
    { id: "FB-006", type: "praise", category: t("adminFeedback.categories.uiux"), message: t("adminFeedback.sampleMessages.darkMode"), rating: 5, user: "designer@tburn.io", createdAt: "2024-11-28T16:45:00Z", status: "archived", response: t("adminFeedback.sampleResponses.glad") },
  ];

  const ratingData = feedbackData?.ratingData || [
    { rating: t("adminFeedback.ratings.5stars"), count: 45, percentage: 35 },
    { rating: t("adminFeedback.ratings.4stars"), count: 38, percentage: 30 },
    { rating: t("adminFeedback.ratings.3stars"), count: 25, percentage: 20 },
    { rating: t("adminFeedback.ratings.2stars"), count: 12, percentage: 9 },
    { rating: t("adminFeedback.ratings.1star"), count: 8, percentage: 6 },
  ];

  const typeDistribution = feedbackData?.typeDistribution || [
    { name: t("adminFeedback.types.suggestions"), value: 40, color: "hsl(var(--chart-1))" },
    { name: t("adminFeedback.types.praise"), value: 30, color: "hsl(var(--chart-2))" },
    { name: t("adminFeedback.types.bugs"), value: 20, color: "hsl(var(--chart-3))" },
    { name: t("adminFeedback.types.complaints"), value: 10, color: "hsl(var(--chart-5))" },
  ];

  const trendData = feedbackData?.trendData || Array.from({ length: 30 }, (_, i) => ({
    day: `${t("adminFeedback.day")} ${i + 1}`,
    feedback: Math.floor(Math.random() * 10) + 5,
    avgRating: 3 + Math.random() * 2,
  }));

  const avgRating = (feedbackItems.reduce((sum, f) => sum + f.rating, 0) / feedbackItems.length).toFixed(1);
  const newCount = feedbackItems.filter(f => f.status === "new").length;
  const responseRate = ((feedbackItems.filter(f => f.response).length / feedbackItems.length) * 100).toFixed(0);

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "suggestion": return <Badge className="bg-blue-500">{t("adminFeedback.types.suggestion")}</Badge>;
      case "praise": return <Badge className="bg-green-500">{t("adminFeedback.types.praiseItem")}</Badge>;
      case "bug": return <Badge className="bg-orange-500">{t("adminFeedback.types.bug")}</Badge>;
      case "complaint": return <Badge className="bg-red-500">{t("adminFeedback.types.complaint")}</Badge>;
      default: return <Badge>{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new": return <Badge variant="outline" className="text-blue-500 border-blue-500">{t("adminFeedback.status.new")}</Badge>;
      case "reviewed": return <Badge variant="secondary">{t("adminFeedback.status.reviewed")}</Badge>;
      case "actioned": return <Badge className="bg-green-500">{t("adminFeedback.status.actioned")}</Badge>;
      case "archived": return <Badge variant="outline">{t("adminFeedback.status.archived")}</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getRatingIcon = (rating: number) => {
    if (rating >= 4) return <Smile className="h-4 w-4 text-green-500" />;
    if (rating >= 3) return <Meh className="h-4 w-4 text-yellow-500" />;
    return <Frown className="h-4 w-4 text-red-500" />;
  };

  const filteredFeedback = feedbackItems.filter((item) => {
    const matchesSearch = item.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || item.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleRespondClick = (feedback: FeedbackItem) => {
    setSelectedFeedback(feedback);
    setResponseText(feedback.response || "");
    setIsRespondDialogOpen(true);
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "suggestion": return "bg-blue-500";
      case "praise": return "bg-green-500";
      case "bug": return "bg-orange-500";
      case "complaint": return "bg-red-500";
      default: return "";
    }
  };

  const getRatingBadgeColor = (rating: number) => {
    if (rating >= 4) return "bg-green-500";
    if (rating >= 3) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "new": return "text-blue-500 border-blue-500";
      case "reviewed": return "";
      case "actioned": return "bg-green-500";
      case "archived": return "";
      default: return "";
    }
  };

  const getFeedbackDetailSections = (feedback: FeedbackItem): DetailSection[] => [
    {
      title: t("adminFeedback.detail.feedbackInfo"),
      fields: [
        { label: t("adminFeedback.table.id"), value: feedback.id, type: "code", copyable: true },
        { label: t("adminFeedback.table.type"), value: t(`adminFeedback.types.${feedback.type === "praise" ? "praiseItem" : feedback.type}`), type: "badge", badgeColor: getTypeBadgeColor(feedback.type) },
        { label: t("adminFeedback.table.category"), value: feedback.category },
        { label: t("adminFeedback.table.rating"), value: `${feedback.rating}/5`, type: "badge", badgeColor: getRatingBadgeColor(feedback.rating) },
        { label: t("adminFeedback.table.status"), value: t(`adminFeedback.status.${feedback.status}`), type: "badge", badgeColor: getStatusBadgeColor(feedback.status) },
      ],
    },
    {
      title: t("adminFeedback.detail.content"),
      fields: [
        { label: t("adminFeedback.table.user"), value: feedback.user },
        { label: t("adminFeedback.table.message"), value: feedback.message },
        { label: t("adminFeedback.table.date"), value: feedback.createdAt, type: "date" },
        ...(feedback.response ? [{ label: t("adminFeedback.dialog.yourResponse"), value: feedback.response }] : []),
      ],
    },
  ];

  const confirmArchive = () => {
    if (pendingArchiveId) {
      updateStatusMutation.mutate({ feedbackId: pendingArchiveId, status: "archived" });
      setShowArchiveConfirm(false);
      setPendingArchiveId(null);
    }
  };

  if (error) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="container max-w-[1800px] mx-auto p-6">
          <Card className="border-destructive">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <div className="flex-1">
                  <h3 className="font-semibold">{t("adminFeedback.errorTitle")}</h3>
                  <p className="text-sm text-muted-foreground">{t("adminFeedback.errorDescription")}</p>
                </div>
                <Button onClick={() => refetch()} data-testid="button-retry-feedback">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t("adminFeedback.retry")}
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
              <Skeleton className="h-10 w-24" />
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
              <Skeleton className="h-80 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" data-testid="feedback-system-page">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-feedback-title">
              <MessageSquare className="h-8 w-8" />
              {t("adminFeedback.title")}
            </h1>
            <p className="text-muted-foreground" data-testid="text-feedback-description">
              {t("adminFeedback.description")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh} data-testid="button-refresh-feedback">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminFeedback.refresh")}
            </Button>
            <Button variant="outline" onClick={handleExport} data-testid="button-export-feedback">
              <Download className="h-4 w-4 mr-2" />
              {t("adminFeedback.export")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card data-testid="card-avg-rating">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminFeedback.stats.avgRating")}</p>
                  <p className="text-2xl font-bold" data-testid="text-avg-rating">{avgRating}/5</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-total-feedback">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminFeedback.stats.totalFeedback")}</p>
                  <p className="text-2xl font-bold" data-testid="text-total-feedback">{feedbackItems.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-response-rate">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminFeedback.stats.responseRate")}</p>
                  <p className="text-2xl font-bold text-green-500" data-testid="text-response-rate">{responseRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-pending">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminFeedback.stats.pending")}</p>
                  <p className="text-2xl font-bold" data-testid="text-pending-count">{newCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList data-testid="tabs-feedback">
            <TabsTrigger value="overview" data-testid="tab-overview">{t("adminFeedback.tabs.overview")}</TabsTrigger>
            <TabsTrigger value="feedback" data-testid="tab-feedback">{t("adminFeedback.tabs.allFeedback")}</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">{t("adminFeedback.tabs.analytics")}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2" data-testid="card-feedback-trend">
                <CardHeader>
                  <CardTitle>{t("adminFeedback.charts.feedbackTrend")}</CardTitle>
                  <CardDescription>{t("adminFeedback.charts.feedbackTrendDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="day" className="text-xs" />
                        <YAxis yAxisId="left" className="text-xs" />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 5]} className="text-xs" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="feedback" fill="hsl(var(--chart-1))" name={t("adminFeedback.charts.feedbackCount")} />
                        <Line yAxisId="right" type="monotone" dataKey="avgRating" stroke="hsl(var(--chart-2))" name={t("adminFeedback.charts.avgRating")} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-type-distribution">
                <CardHeader>
                  <CardTitle>{t("adminFeedback.charts.typeDistribution")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={typeDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          dataKey="value"
                        >
                          {typeDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-4">
                    {typeDistribution.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between" data-testid={`distribution-item-${index}`}>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card data-testid="card-rating-distribution">
              <CardHeader>
                <CardTitle>{t("adminFeedback.charts.ratingDistribution")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ratingData.map((item, index) => (
                    <div key={item.rating} className="flex items-center gap-4" data-testid={`rating-item-${index}`}>
                      <div className="w-20 text-sm">{item.rating}</div>
                      <Progress value={item.percentage} className="flex-1" />
                      <div className="w-16 text-sm text-right">{item.count} ({item.percentage}%)</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <Card data-testid="card-all-feedback">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle>{t("adminFeedback.allFeedback")}</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={t("adminFeedback.searchPlaceholder")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-feedback"
                      />
                    </div>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="w-32" data-testid="select-type">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("adminFeedback.filters.allTypes")}</SelectItem>
                        <SelectItem value="suggestion">{t("adminFeedback.types.suggestions")}</SelectItem>
                        <SelectItem value="praise">{t("adminFeedback.types.praise")}</SelectItem>
                        <SelectItem value="bug">{t("adminFeedback.types.bugs")}</SelectItem>
                        <SelectItem value="complaint">{t("adminFeedback.types.complaints")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("adminFeedback.table.id")}</TableHead>
                      <TableHead>{t("adminFeedback.table.type")}</TableHead>
                      <TableHead>{t("adminFeedback.table.category")}</TableHead>
                      <TableHead>{t("adminFeedback.table.message")}</TableHead>
                      <TableHead>{t("adminFeedback.table.rating")}</TableHead>
                      <TableHead>{t("adminFeedback.table.user")}</TableHead>
                      <TableHead>{t("adminFeedback.table.status")}</TableHead>
                      <TableHead>{t("adminFeedback.table.date")}</TableHead>
                      <TableHead className="text-right">{t("adminFeedback.table.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFeedback.map((item, index) => (
                      <TableRow key={item.id} data-testid={`feedback-row-${index}`}>
                        <TableCell className="font-mono">{item.id}</TableCell>
                        <TableCell>{getTypeBadge(item.type)}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="max-w-xs truncate">{item.message}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getRatingIcon(item.rating)}
                            {item.rating}/5
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{item.user}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString('en-US', { timeZone: 'America/New_York' })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setDetailFeedback(item);
                                setShowFeedbackDetail(true);
                              }}
                              data-testid={`button-view-feedback-${index}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleRespondClick(item)}
                              data-testid={`button-respond-${index}`}
                            >
                              <Send className="h-4 w-4 mr-1" />
                              {item.response ? t("adminFeedback.edit") : t("adminFeedback.respond")}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card data-testid="card-category-analysis">
                <CardHeader>
                  <CardTitle>{t("adminFeedback.analytics.categoryAnalysis")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      t("adminFeedback.categories.dashboard"), 
                      t("adminFeedback.categories.performance"), 
                      t("adminFeedback.categories.alerts"), 
                      t("adminFeedback.categories.documentation"), 
                      t("adminFeedback.categories.security"), 
                      t("adminFeedback.categories.uiux")
                    ].map((cat, index) => (
                      <div key={cat} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`category-item-${index}`}>
                        <span>{cat}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{Math.floor(Math.random() * 20) + 5}</Badge>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            {(3 + Math.random() * 2).toFixed(1)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-top-issues">
                <CardHeader>
                  <CardTitle>{t("adminFeedback.analytics.topIssues")}</CardTitle>
                  <CardDescription>{t("adminFeedback.analytics.topIssuesDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { issue: t("adminFeedback.issues.dashboardSpeed"), mentions: 15 },
                      { issue: t("adminFeedback.issues.alertDelays"), mentions: 12 },
                      { issue: t("adminFeedback.issues.apiDocs"), mentions: 10 },
                      { issue: t("adminFeedback.issues.mobileResponsive"), mentions: 8 },
                      { issue: t("adminFeedback.issues.searchFunc"), mentions: 6 },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between" data-testid={`issue-item-${i}`}>
                        <span className="text-sm">{item.issue}</span>
                        <Badge variant="secondary">{item.mentions} {t("adminFeedback.mentions")}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={isRespondDialogOpen} onOpenChange={setIsRespondDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("adminFeedback.dialog.respondTitle")}</DialogTitle>
              <DialogDescription>{t("adminFeedback.dialog.respondDesc")}</DialogDescription>
            </DialogHeader>
            {selectedFeedback && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeBadge(selectedFeedback.type)}
                    <span className="text-sm text-muted-foreground">{selectedFeedback.user}</span>
                  </div>
                  <p className="text-sm">{selectedFeedback.message}</p>
                </div>
                <div className="space-y-2">
                  <Label>{t("adminFeedback.dialog.yourResponse")}</Label>
                  <Textarea
                    placeholder={t("adminFeedback.dialog.responsePlaceholder")}
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows={4}
                    data-testid="input-response"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRespondDialogOpen(false)} data-testid="button-cancel-response">
                {t("adminFeedback.dialog.cancel")}
              </Button>
              <Button 
                onClick={() => selectedFeedback && respondMutation.mutate({ feedbackId: selectedFeedback.id, response: responseText })}
                disabled={respondMutation.isPending || !responseText.trim()}
                data-testid="button-send-response"
              >
                <Send className="h-4 w-4 mr-2" />
                {t("adminFeedback.dialog.send")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {detailFeedback && (
          <DetailSheet
            open={showFeedbackDetail}
            onOpenChange={setShowFeedbackDetail}
            title={detailFeedback.id}
            description={detailFeedback.message.substring(0, 100) + (detailFeedback.message.length > 100 ? "..." : "")}
            icon={<MessageSquare className="h-5 w-5" />}
            sections={getFeedbackDetailSections(detailFeedback)}
            actions={[
              {
                label: t("adminFeedback.archive"),
                onClick: () => {
                  setPendingArchiveId(detailFeedback.id);
                  setShowArchiveConfirm(true);
                },
                variant: "outline",
                disabled: detailFeedback.status === "archived",
              },
              {
                label: t("adminFeedback.respond"),
                icon: <Send className="h-4 w-4" />,
                onClick: () => {
                  setShowFeedbackDetail(false);
                  handleRespondClick(detailFeedback);
                },
              },
            ]}
          />
        )}

        <ConfirmationDialog
          open={showArchiveConfirm}
          onOpenChange={setShowArchiveConfirm}
          title={t("adminFeedback.confirm.archiveTitle")}
          description={t("adminFeedback.confirm.archiveDesc")}
          confirmText={t("adminFeedback.archive")}
          cancelText={t("adminFeedback.cancel")}
          onConfirm={confirmArchive}
          isLoading={updateStatusMutation.isPending}
          destructive={false}
        />
      </div>
    </div>
  );
}
