import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import {
  Mail,
  Search,
  Download,
  Trash2,
  RefreshCw,
  Users,
  UserCheck,
  UserMinus,
  Calendar,
  Globe,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface NewsletterSubscriber {
  id: string;
  email: string;
  status: string;
  source: string | null;
  ipAddress: string | null;
  subscribedAt: string;
  unsubscribedAt: string | null;
}

interface SubscribersData {
  subscribers: NewsletterSubscriber[];
  total: number;
}

export default function AdminNewsletter() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSubscriber, setSelectedSubscriber] = useState<NewsletterSubscriber | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, isLoading, error, refetch } = useQuery<SubscribersData>({
    queryKey: ["/api/admin/newsletter/subscribers", statusFilter],
    queryFn: async () => {
      const url = statusFilter !== "all" 
        ? `/api/admin/newsletter/subscribers?status=${statusFilter}`
        : "/api/admin/newsletter/subscribers";
      const res = await apiRequest("GET", url);
      return res.json();
    },
    refetchInterval: 30000,
    retry: 3,
  });

  const subscribers: NewsletterSubscriber[] = data?.subscribers ?? [];
  const total = data?.total ?? 0;

  const filteredSubscribers = subscribers.filter(sub => {
    const matchesSearch = searchQuery === "" ||
      sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.source && sub.source.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/newsletter/subscribers/${id}`);
    },
    onSuccess: () => {
      toast({
        title: t("adminNewsletter.deleteSuccess") || "Subscriber deleted",
        description: t("adminNewsletter.deleteSuccessDesc") || "The subscriber has been removed.",
      });
      queryClient.invalidateQueries({ predicate: (query) => 
        query.queryKey[0] === "/api/admin/newsletter/subscribers"
      });
      setShowDeleteConfirm(false);
      setSelectedSubscriber(null);
    },
    onError: () => {
      toast({
        title: t("adminNewsletter.deleteError") || "Error",
        description: t("adminNewsletter.deleteErrorDesc") || "Failed to delete subscriber.",
        variant: "destructive",
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: string }) => {
      return apiRequest("PATCH", `/api/admin/newsletter/subscribers/${id}`, { status: newStatus });
    },
    onSuccess: () => {
      toast({
        title: t("adminNewsletter.statusUpdated") || "Status updated",
        description: t("adminNewsletter.statusUpdatedDesc") || "Subscriber status has been changed.",
      });
      queryClient.invalidateQueries({ predicate: (query) => 
        query.queryKey[0] === "/api/admin/newsletter/subscribers"
      });
    },
    onError: () => {
      toast({
        title: t("adminNewsletter.updateError") || "Error",
        description: t("adminNewsletter.updateErrorDesc") || "Failed to update subscriber.",
        variant: "destructive",
      });
    },
  });

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: t("adminNewsletter.refreshSuccess") || "Refreshed",
        description: t("adminNewsletter.refreshSuccessDesc") || "Subscriber list updated.",
      });
    } catch {
      toast({
        title: t("adminNewsletter.refreshError") || "Error",
        description: t("adminNewsletter.refreshErrorDesc") || "Failed to refresh data.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast, t]);

  const handleExport = useCallback(async () => {
    try {
      const res = await apiRequest("GET", "/api/admin/newsletter/export");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `newsletter_subscribers_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: t("adminNewsletter.exportSuccess") || "Export complete",
        description: t("adminNewsletter.exportSuccessDesc") || "CSV file downloaded.",
      });
    } catch {
      toast({
        title: t("adminNewsletter.exportError") || "Export failed",
        description: t("adminNewsletter.exportErrorDesc") || "Failed to export CSV.",
        variant: "destructive",
      });
    }
  }, [toast, t]);

  const formatTimestamp = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', { timeZone: 'America/New_York' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": 
        return <Badge className="bg-green-500/10 text-green-500" data-testid={`badge-status-${status}`}>{t("adminNewsletter.statusActive") || "Active"}</Badge>;
      case "unsubscribed": 
        return <Badge className="bg-gray-500/10 text-gray-500" data-testid={`badge-status-${status}`}>{t("adminNewsletter.statusUnsubscribed") || "Unsubscribed"}</Badge>;
      default: 
        return <Badge variant="secondary" data-testid={`badge-status-${status}`}>{status}</Badge>;
    }
  };

  const getSourceBadge = (source: string | null) => {
    if (!source) return <span className="text-muted-foreground">-</span>;
    switch (source) {
      case "footer": 
        return <Badge variant="outline" className="text-xs">{t("adminNewsletter.sourceFooter") || "Footer"}</Badge>;
      case "popup": 
        return <Badge variant="outline" className="text-xs">{t("adminNewsletter.sourcePopup") || "Popup"}</Badge>;
      case "landing": 
        return <Badge variant="outline" className="text-xs">{t("adminNewsletter.sourceLanding") || "Landing"}</Badge>;
      default: 
        return <Badge variant="outline" className="text-xs">{source}</Badge>;
    }
  };

  const activeCount = subscribers.filter(s => s.status === "active").length;
  const unsubscribedCount = subscribers.filter(s => s.status === "unsubscribed").length;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{t("adminNewsletter.loadError") || "Failed to load subscriber data"}</p>
            <Button onClick={() => refetch()} className="mt-4" data-testid="button-retry">
              {t("common.retry") || "Retry"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-page-title">
            <Mail className="h-6 w-6" />
            {t("adminNewsletter.title") || "Newsletter Subscribers"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("adminNewsletter.description") || "Manage newsletter subscription list"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            data-testid="button-refresh"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {t("common.refresh") || "Refresh"}
          </Button>
          <Button onClick={handleExport} data-testid="button-export">
            <Download className="h-4 w-4 mr-2" />
            {t("adminNewsletter.exportCsv") || "Export CSV"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("adminNewsletter.totalSubscribers") || "Total Subscribers"}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-count">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("adminNewsletter.activeSubscribers") || "Active"}</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500" data-testid="text-active-count">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("adminNewsletter.unsubscribed") || "Unsubscribed"}</CardTitle>
            <UserMinus className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500" data-testid="text-unsubscribed-count">{unsubscribedCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>{t("adminNewsletter.subscriberList") || "Subscriber List"}</CardTitle>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("adminNewsletter.searchPlaceholder") || "Search email..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]" data-testid="select-status-filter">
                  <SelectValue placeholder={t("adminNewsletter.allStatus") || "All Status"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("adminNewsletter.allStatus") || "All Status"}</SelectItem>
                  <SelectItem value="active">{t("adminNewsletter.statusActive") || "Active"}</SelectItem>
                  <SelectItem value="unsubscribed">{t("adminNewsletter.statusUnsubscribed") || "Unsubscribed"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("adminNewsletter.email") || "Email"}</TableHead>
                  <TableHead>{t("adminNewsletter.status") || "Status"}</TableHead>
                  <TableHead>{t("adminNewsletter.source") || "Source"}</TableHead>
                  <TableHead>{t("adminNewsletter.subscribedAt") || "Subscribed At"}</TableHead>
                  <TableHead className="text-right">{t("adminNewsletter.actions") || "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscribers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      {t("adminNewsletter.noSubscribers") || "No subscribers found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubscribers.map((subscriber) => (
                    <TableRow key={subscriber.id} data-testid={`row-subscriber-${subscriber.id}`}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {subscriber.email}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(subscriber.status)}</TableCell>
                      <TableCell>{getSourceBadge(subscriber.source)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatTimestamp(subscriber.subscribedAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newStatus = subscriber.status === "active" ? "unsubscribed" : "active";
                              toggleStatusMutation.mutate({ id: subscriber.id, newStatus });
                            }}
                            disabled={toggleStatusMutation.isPending}
                            data-testid={`button-toggle-status-${subscriber.id}`}
                          >
                            {subscriber.status === "active" ? (
                              <><UserMinus className="h-3 w-3 mr-1" /> {t("adminNewsletter.unsubscribe") || "Unsubscribe"}</>
                            ) : (
                              <><UserCheck className="h-3 w-3 mr-1" /> {t("adminNewsletter.resubscribe") || "Resubscribe"}</>
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedSubscriber(subscriber);
                              setShowDeleteConfirm(true);
                            }}
                            data-testid={`button-delete-${subscriber.id}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title={t("adminNewsletter.deleteConfirmTitle") || "Delete Subscriber"}
        description={t("adminNewsletter.deleteConfirmDesc") || `Are you sure you want to delete ${selectedSubscriber?.email}? This action cannot be undone.`}
        confirmText={t("common.delete") || "Delete"}
        cancelText={t("common.cancel") || "Cancel"}
        actionType="delete"
        destructive={true}
        onConfirm={() => {
          if (selectedSubscriber) {
            deleteMutation.mutate(selectedSubscriber.id);
          }
        }}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
