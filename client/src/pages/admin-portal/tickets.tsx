import { useState, useCallback, useEffect, useRef } from "react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Ticket,
  Plus,
  Search,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Paperclip,
  Send,
  Download,
  AlertCircle,
} from "lucide-react";

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in-progress" | "waiting" | "resolved" | "closed";
  requester: string;
  assignee: string | null;
  createdAt: string;
  updatedAt: string;
  responses: number;
}

interface TicketMessage {
  id: string;
  sender: string;
  isAdmin: boolean;
  message: string;
  timestamp: string;
}

interface TicketData {
  tickets: SupportTicket[];
  messages: TicketMessage[];
}

export default function SupportTickets() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [replyMessage, setReplyMessage] = useState("");
  const wsRef = useRef<WebSocket | null>(null);

  const { data: ticketData, isLoading, error, refetch } = useQuery<TicketData>({
    queryKey: ["/api/admin/tickets"],
  });

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/tickets`;
    
    try {
      wsRef.current = new WebSocket(wsUrl);
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "ticket_update") {
          queryClient.invalidateQueries({ queryKey: ["/api/admin/tickets"] });
        }
      };
    } catch (err) {
      console.log("WebSocket connection failed");
    }

    return () => {
      wsRef.current?.close();
    };
  }, []);

  const createTicketMutation = useMutation({
    mutationFn: async (ticket: { title: string; category: string; priority: string; description: string }) => {
      return apiRequest("/api/admin/tickets", {
        method: "POST",
        body: JSON.stringify(ticket),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tickets"] });
      setIsCreateDialogOpen(false);
      toast({
        title: t("adminTickets.ticketCreated"),
        description: t("adminTickets.ticketCreatedDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminTickets.error"),
        description: t("adminTickets.createError"),
        variant: "destructive",
      });
    },
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      return apiRequest(`/api/admin/tickets/${ticketId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tickets"] });
      toast({
        title: t("adminTickets.ticketUpdated"),
        description: t("adminTickets.ticketUpdatedDesc"),
      });
    },
  });

  const closeTicketMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      return apiRequest(`/api/admin/tickets/${ticketId}/close`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tickets"] });
      toast({
        title: t("adminTickets.ticketClosed"),
        description: t("adminTickets.ticketClosedDesc"),
      });
    },
  });

  const handleRefresh = useCallback(() => {
    refetch();
    toast({
      title: t("adminTickets.refreshed"),
      description: t("adminTickets.refreshedDesc"),
    });
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      tickets,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tickets-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: t("adminTickets.exported"),
      description: t("adminTickets.exportedDesc"),
    });
  }, [toast, t]);

  const tickets: SupportTicket[] = ticketData?.tickets || [
    { id: "TKT-001", title: t("adminTickets.sampleTickets.accessIssue.title"), description: t("adminTickets.sampleTickets.accessIssue.desc"), category: t("adminTickets.categories.accessIssue"), priority: "high", status: "in-progress", requester: "admin@tburn.io", assignee: "support@tburn.io", createdAt: "2024-12-03T10:30:00Z", updatedAt: "2024-12-03T14:20:00Z", responses: 3 },
    { id: "TKT-002", title: t("adminTickets.sampleTickets.dashboard.title"), description: t("adminTickets.sampleTickets.dashboard.desc"), category: t("adminTickets.categories.bugReport"), priority: "critical", status: "open", requester: "ops@tburn.io", assignee: null, createdAt: "2024-12-03T09:15:00Z", updatedAt: "2024-12-03T09:15:00Z", responses: 0 },
    { id: "TKT-003", title: t("adminTickets.sampleTickets.apiDocs.title"), description: t("adminTickets.sampleTickets.apiDocs.desc"), category: t("adminTickets.categories.documentation"), priority: "low", status: "resolved", requester: "dev@tburn.io", assignee: "support@tburn.io", createdAt: "2024-12-02T16:45:00Z", updatedAt: "2024-12-03T11:30:00Z", responses: 5 },
    { id: "TKT-004", title: t("adminTickets.sampleTickets.alertNotif.title"), description: t("adminTickets.sampleTickets.alertNotif.desc"), category: t("adminTickets.categories.bugReport"), priority: "high", status: "waiting", requester: "security@tburn.io", assignee: "support@tburn.io", createdAt: "2024-12-02T14:00:00Z", updatedAt: "2024-12-03T08:00:00Z", responses: 2 },
    { id: "TKT-005", title: t("adminTickets.sampleTickets.customDashboard.title"), description: t("adminTickets.sampleTickets.customDashboard.desc"), category: t("adminTickets.categories.featureRequest"), priority: "medium", status: "open", requester: "analyst@tburn.io", assignee: null, createdAt: "2024-12-01T11:20:00Z", updatedAt: "2024-12-01T11:20:00Z", responses: 1 },
    { id: "TKT-006", title: t("adminTickets.sampleTickets.training.title"), description: t("adminTickets.sampleTickets.training.desc"), category: t("adminTickets.categories.training"), priority: "medium", status: "closed", requester: "hr@tburn.io", assignee: "support@tburn.io", createdAt: "2024-11-28T09:00:00Z", updatedAt: "2024-12-01T16:00:00Z", responses: 8 },
  ];

  const ticketMessages: TicketMessage[] = ticketData?.messages || [
    { id: "1", sender: "admin@tburn.io", isAdmin: false, message: t("adminTickets.messages.sample1"), timestamp: "2024-12-03T10:30:00Z" },
    { id: "2", sender: t("adminTickets.supportTeam"), isAdmin: true, message: t("adminTickets.messages.sample2"), timestamp: "2024-12-03T11:45:00Z" },
    { id: "3", sender: "admin@tburn.io", isAdmin: false, message: t("adminTickets.messages.sample3"), timestamp: "2024-12-03T12:30:00Z" },
    { id: "4", sender: t("adminTickets.supportTeam"), isAdmin: true, message: t("adminTickets.messages.sample4"), timestamp: "2024-12-03T14:20:00Z" },
  ];

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical": return <Badge className="bg-red-500">{t("adminTickets.priority.critical")}</Badge>;
      case "high": return <Badge className="bg-orange-500">{t("adminTickets.priority.high")}</Badge>;
      case "medium": return <Badge className="bg-yellow-500">{t("adminTickets.priority.medium")}</Badge>;
      case "low": return <Badge className="bg-blue-500">{t("adminTickets.priority.low")}</Badge>;
      default: return <Badge>{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open": return <Badge variant="outline" className="text-blue-500 border-blue-500">{t("adminTickets.status.open")}</Badge>;
      case "in-progress": return <Badge className="bg-purple-500">{t("adminTickets.status.inProgress")}</Badge>;
      case "waiting": return <Badge variant="secondary">{t("adminTickets.status.waiting")}</Badge>;
      case "resolved": return <Badge className="bg-green-500">{t("adminTickets.status.resolved")}</Badge>;
      case "closed": return <Badge variant="outline">{t("adminTickets.status.closed")}</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const title = ticket.title || '';
    const id = ticket.id || '';
    const matchesSearch = 
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = selectedPriority === "all" || ticket.priority === selectedPriority;
    const matchesTab = activeTab === "all" || 
      (activeTab === "open" && (ticket.status === "open" || ticket.status === "in-progress" || ticket.status === "waiting")) ||
      (activeTab === "resolved" && (ticket.status === "resolved" || ticket.status === "closed"));
    return matchesSearch && matchesPriority && matchesTab;
  });

  const openCount = tickets.filter(t => t.status === "open" || t.status === "in-progress" || t.status === "waiting").length;
  const criticalCount = tickets.filter(t => t.priority === "critical" && t.status !== "resolved" && t.status !== "closed").length;
  const avgResponseTime = "2.5h";

  if (error) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="container max-w-[1800px] mx-auto p-6">
          <Card className="border-destructive">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <div className="flex-1">
                  <h3 className="font-semibold">{t("adminTickets.errorTitle")}</h3>
                  <p className="text-sm text-muted-foreground">{t("adminTickets.errorDescription")}</p>
                </div>
                <Button onClick={() => refetch()} data-testid="button-retry-tickets">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t("adminTickets.retry")}
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
              <Skeleton className="h-10 w-32" />
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
    <div className="flex-1 overflow-auto" data-testid="support-tickets-page">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-tickets-title">
              <Ticket className="h-8 w-8" />
              {t("adminTickets.title")}
            </h1>
            <p className="text-muted-foreground" data-testid="text-tickets-description">
              {t("adminTickets.description")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh} data-testid="button-refresh-tickets">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminTickets.refresh")}
            </Button>
            <Button variant="outline" onClick={handleExport} data-testid="button-export-tickets">
              <Download className="h-4 w-4 mr-2" />
              {t("adminTickets.export")}
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-new-ticket">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("adminTickets.newTicket")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t("adminTickets.dialog.createTitle")}</DialogTitle>
                  <DialogDescription>{t("adminTickets.dialog.createDesc")}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t("adminTickets.dialog.title")}</Label>
                    <Input placeholder={t("adminTickets.dialog.titlePlaceholder")} data-testid="input-ticket-title" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("adminTickets.dialog.category")}</Label>
                      <Select>
                        <SelectTrigger data-testid="select-ticket-category">
                          <SelectValue placeholder={t("adminTickets.dialog.selectCategory")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bug">{t("adminTickets.categories.bugReport")}</SelectItem>
                          <SelectItem value="access">{t("adminTickets.categories.accessIssue")}</SelectItem>
                          <SelectItem value="feature">{t("adminTickets.categories.featureRequest")}</SelectItem>
                          <SelectItem value="docs">{t("adminTickets.categories.documentation")}</SelectItem>
                          <SelectItem value="training">{t("adminTickets.categories.training")}</SelectItem>
                          <SelectItem value="other">{t("adminTickets.categories.other")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("adminTickets.dialog.priority")}</Label>
                      <Select>
                        <SelectTrigger data-testid="select-ticket-priority">
                          <SelectValue placeholder={t("adminTickets.dialog.selectPriority")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">{t("adminTickets.priority.low")}</SelectItem>
                          <SelectItem value="medium">{t("adminTickets.priority.medium")}</SelectItem>
                          <SelectItem value="high">{t("adminTickets.priority.high")}</SelectItem>
                          <SelectItem value="critical">{t("adminTickets.priority.critical")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adminTickets.dialog.description")}</Label>
                    <Textarea placeholder={t("adminTickets.dialog.descPlaceholder")} rows={5} data-testid="input-ticket-description" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adminTickets.dialog.attachments")}</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      <Paperclip className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">{t("adminTickets.dialog.dropFiles")}</p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} data-testid="button-cancel-ticket">
                    {t("adminTickets.dialog.cancel")}
                  </Button>
                  <Button onClick={() => setIsCreateDialogOpen(false)} data-testid="button-submit-ticket">
                    {t("adminTickets.dialog.submit")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card data-testid="card-open-tickets">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Ticket className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminTickets.stats.openTickets")}</p>
                  <p className="text-2xl font-bold" data-testid="text-open-count">{openCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-critical">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminTickets.stats.critical")}</p>
                  <p className="text-2xl font-bold text-red-500" data-testid="text-critical-count">{criticalCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-resolved">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminTickets.stats.resolvedToday")}</p>
                  <p className="text-2xl font-bold text-green-500" data-testid="text-resolved-count">3</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-response-time">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminTickets.stats.avgResponse")}</p>
                  <p className="text-2xl font-bold" data-testid="text-response-time">{avgResponseTime}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2" data-testid="card-tickets-list">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                  <TabsList data-testid="tabs-tickets">
                    <TabsTrigger value="all" data-testid="tab-all">{t("adminTickets.tabs.all")}</TabsTrigger>
                    <TabsTrigger value="open" data-testid="tab-open">{t("adminTickets.tabs.open")}</TabsTrigger>
                    <TabsTrigger value="resolved" data-testid="tab-resolved">{t("adminTickets.tabs.resolved")}</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="flex items-center gap-2">
                  <div className="relative w-48">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t("adminTickets.searchPlaceholder")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-tickets"
                    />
                  </div>
                  <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                    <SelectTrigger className="w-32" data-testid="select-filter-priority">
                      <SelectValue placeholder={t("adminTickets.priority.label")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("adminTickets.all")}</SelectItem>
                      <SelectItem value="critical">{t("adminTickets.priority.critical")}</SelectItem>
                      <SelectItem value="high">{t("adminTickets.priority.high")}</SelectItem>
                      <SelectItem value="medium">{t("adminTickets.priority.medium")}</SelectItem>
                      <SelectItem value="low">{t("adminTickets.priority.low")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("adminTickets.table.ticket")}</TableHead>
                    <TableHead>{t("adminTickets.table.priority")}</TableHead>
                    <TableHead>{t("adminTickets.table.status")}</TableHead>
                    <TableHead>{t("adminTickets.table.requester")}</TableHead>
                    <TableHead>{t("adminTickets.table.updated")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket, index) => (
                    <TableRow 
                      key={ticket.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedTicket(ticket)}
                      data-testid={`ticket-row-${index}`}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{ticket.id}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-xs">{ticket.title}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell className="text-sm">{ticket.requester}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(ticket.updatedAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card data-testid="card-ticket-details">
            <CardHeader>
              <CardTitle>
                {selectedTicket ? `${t("adminTickets.ticket")} ${selectedTicket.id}` : t("adminTickets.selectTicket")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTicket ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">{selectedTicket.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{selectedTicket.description}</p>
                  </div>
                  <div className="flex gap-2">
                    {getPriorityBadge(selectedTicket.priority)}
                    {getStatusBadge(selectedTicket.status)}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("adminTickets.details.category")}</span>
                      <span>{selectedTicket.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("adminTickets.details.requester")}</span>
                      <span>{selectedTicket.requester}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("adminTickets.details.assignee")}</span>
                      <span>{selectedTicket.assignee || t("adminTickets.unassigned")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("adminTickets.details.created")}</span>
                      <span>{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h5 className="font-medium mb-3">{t("adminTickets.conversation")}</h5>
                    <ScrollArea className="h-48">
                      <div className="space-y-3">
                        {ticketMessages.map((msg, index) => (
                          <div key={msg.id} className={`flex gap-2 ${msg.isAdmin ? "" : "flex-row-reverse"}`} data-testid={`message-${index}`}>
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className={msg.isAdmin ? "bg-primary text-primary-foreground" : ""}>
                                {msg.isAdmin ? "S" : "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`max-w-[80%] p-3 rounded-lg ${
                              msg.isAdmin ? "bg-primary/10" : "bg-muted"
                            }`}>
                              <p className="text-sm">{msg.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  <div className="flex gap-2">
                    <Input 
                      placeholder={t("adminTickets.typeReply")} 
                      className="flex-1" 
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      data-testid="input-reply"
                    />
                    <Button size="icon" data-testid="button-send-reply">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t("adminTickets.selectTicketToView")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
