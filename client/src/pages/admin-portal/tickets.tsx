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
import { DetailSheet, type DetailSection } from "@/components/admin/detail-sheet";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
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
  Eye,
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
  const [showTicketDetail, setShowTicketDetail] = useState(false);
  const [detailTicket, setDetailTicket] = useState<SupportTicket | null>(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [pendingCloseId, setPendingCloseId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const { data: ticketData, isLoading, error, refetch } = useQuery<TicketData>({
    queryKey: ["/api/enterprise/admin/tickets"],
    refetchInterval: 15000,
    staleTime: 15000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/tickets`;
    
    try {
      wsRef.current = new WebSocket(wsUrl);
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "ticket_update") {
          queryClient.invalidateQueries({ queryKey: ["/api/enterprise/admin/tickets"] });
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
      return apiRequest("POST", "/api/enterprise/admin/tickets", ticket);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enterprise/admin/tickets"] });
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
      return apiRequest("PATCH", `/api/enterprise/admin/tickets/${ticketId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enterprise/admin/tickets"] });
      toast({
        title: t("adminTickets.ticketUpdated"),
        description: t("adminTickets.ticketUpdatedDesc"),
      });
    },
  });

  const closeTicketMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      return apiRequest("POST", `/api/enterprise/admin/tickets/${ticketId}/close`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enterprise/admin/tickets"] });
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
    { id: "TKT-001", title: "Mainnet v8.0 Launch Verification Request", description: "Pre-launch verification for December 8th genesis block deployment - all 156 validators ready", category: "Mainnet Launch", priority: "critical", status: "resolved", requester: "cto@tburn.io", assignee: "core-team@tburn.io", createdAt: "2024-12-07T08:00:00Z", updatedAt: "2024-12-07T16:00:00Z", responses: 12 },
    { id: "TKT-002", title: "Triple-Band AI Failover Test Completed", description: "AI Engine α → β → γ failover chain verified successfully", category: "AI Systems", priority: "high", status: "resolved", requester: "ai-ops@tburn.io", assignee: "ai-team@tburn.io", createdAt: "2024-12-06T14:00:00Z", updatedAt: "2024-12-07T10:00:00Z", responses: 8 },
    { id: "TKT-003", title: "100K TPS Stress Test Documentation", description: "Final stress test results: 485K-520K TPS achieved, P99 latency 42-45ms across 8 shards", category: "Performance", priority: "high", status: "resolved", requester: "network@tburn.io", assignee: "support@tburn.io", createdAt: "2024-12-05T16:45:00Z", updatedAt: "2024-12-06T11:30:00Z", responses: 6 },
    { id: "TKT-004", title: "Multi-Chain Bridge v2.0 Integration Complete", description: "ETH/BSC/Polygon/Arbitrum bridge fully operational with AI risk assessment active", category: "Bridge Operations", priority: "high", status: "resolved", requester: "bridge@tburn.io", assignee: "bridge-team@tburn.io", createdAt: "2024-12-04T14:00:00Z", updatedAt: "2024-12-05T18:00:00Z", responses: 9 },
    { id: "TKT-005", title: "Quantum-Resistant Security Audit Passed", description: "CertiK audit complete - 99.7% security score achieved with CRYSTALS-Dilithium implementation", category: "Security", priority: "critical", status: "resolved", requester: "ciso@tburn.io", assignee: "security-team@tburn.io", createdAt: "2024-12-03T11:20:00Z", updatedAt: "2024-12-04T16:00:00Z", responses: 15 },
    { id: "TKT-006", title: "156 Validator Network Synchronization", description: "All validators synchronized and bonded across 3-tier structure (Tier 1: 20M, Tier 2: 5M, Tier 3: 10K)", category: "Validator Operations", priority: "high", status: "resolved", requester: "validators@tburn.io", assignee: "network-team@tburn.io", createdAt: "2024-12-02T09:00:00Z", updatedAt: "2024-12-03T14:00:00Z", responses: 11 },
  ];

  const ticketMessages: TicketMessage[] = ticketData?.messages || [
    { id: "1", sender: "cto@tburn.io", isAdmin: false, message: "Requesting final pre-launch verification for all mainnet v8.0 systems ahead of December 8th genesis block.", timestamp: "2024-12-07T08:00:00Z" },
    { id: "2", sender: "Core Engineering Team", isAdmin: true, message: "All 156 validators synchronized, Triple-Band AI operational, 8 shards active. Genesis block parameters confirmed: 10B TBURN @ $0.50.", timestamp: "2024-12-07T10:00:00Z" },
    { id: "3", sender: "cto@tburn.io", isAdmin: false, message: "Please confirm quantum-resistant signatures and multi-chain bridge v2.0 status.", timestamp: "2024-12-07T12:00:00Z" },
    { id: "4", sender: "Core Engineering Team", isAdmin: true, message: "CRYSTALS-Dilithium signatures active, CertiK 99.7% score verified. ETH/BSC/Polygon/Arbitrum bridges operational. All systems GO for December 8th launch.", timestamp: "2024-12-07T16:00:00Z" },
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

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-blue-500";
      default: return "";
    }
  };

  const getStatusBadgeConfig = (status: string) => {
    switch (status) {
      case "open": return { variant: "outline" as const, color: "text-blue-500 border-blue-500" };
      case "in-progress": return { variant: "default" as const, color: "bg-purple-500" };
      case "waiting": return { variant: "secondary" as const, color: "" };
      case "resolved": return { variant: "default" as const, color: "bg-green-500" };
      case "closed": return { variant: "outline" as const, color: "" };
      default: return { variant: "default" as const, color: "" };
    }
  };

  const getTicketDetailSections = (ticket: SupportTicket): DetailSection[] => [
    {
      title: t("adminTickets.detail.ticketInfo"),
      fields: [
        { label: t("common.id"), value: ticket.id, type: "code", copyable: true },
        { label: t("adminTickets.dialog.title"), value: ticket.title },
        { label: t("adminTickets.details.category"), value: ticket.category },
        { 
          label: t("adminTickets.priority.label"), 
          value: t(`adminTickets.priority.${ticket.priority}`), 
          type: "badge",
          badgeColor: getPriorityBadgeColor(ticket.priority)
        },
        { 
          label: t("common.status"), 
          value: t(`adminTickets.status.${ticket.status === "in-progress" ? "inProgress" : ticket.status}`), 
          type: "badge",
          badgeVariant: getStatusBadgeConfig(ticket.status).variant,
          badgeColor: getStatusBadgeConfig(ticket.status).color
        },
      ],
    },
    {
      title: t("adminTickets.detail.details"),
      fields: [
        { label: t("adminTickets.details.requester"), value: ticket.requester },
        { label: t("adminTickets.details.assignee"), value: ticket.assignee || t("adminTickets.unassigned") },
        { label: t("adminTickets.conversation"), value: ticket.responses },
        { label: t("adminTickets.createdAt"), value: ticket.createdAt, type: "date" },
        { label: t("adminTickets.updatedAt"), value: ticket.updatedAt, type: "date" },
      ],
    },
  ];

  const confirmClose = useCallback(() => {
    if (pendingCloseId) {
      closeTicketMutation.mutate(pendingCloseId);
      setShowCloseConfirm(false);
      setPendingCloseId(null);
    }
  }, [pendingCloseId, closeTicketMutation]);

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
                    <TableHead>{t("adminTickets.actions")}</TableHead>
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
                        {new Date(ticket.updatedAt).toLocaleString('en-US', { timeZone: 'America/New_York' })}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailTicket(ticket);
                            setShowTicketDetail(true);
                          }}
                          data-testid={`button-view-ticket-${index}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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
                      <span>{new Date(selectedTicket.createdAt).toLocaleString('en-US', { timeZone: 'America/New_York' })}</span>
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
                                {new Date(msg.timestamp).toLocaleTimeString('en-US', { timeZone: 'America/New_York' })}
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

        {detailTicket && (
          <DetailSheet
            open={showTicketDetail}
            onOpenChange={setShowTicketDetail}
            title={detailTicket.title}
            subtitle={detailTicket.id}
            icon={<Ticket className="h-5 w-5" />}
            sections={getTicketDetailSections(detailTicket)}
          />
        )}

        <ConfirmationDialog
          open={showCloseConfirm}
          onOpenChange={setShowCloseConfirm}
          title={t("adminTickets.confirm.closeTitle")}
          description={t("adminTickets.confirm.closeDesc")}
          onConfirm={confirmClose}
          destructive={false}
          confirmText={t("common.confirm")}
          cancelText={t("adminTickets.cancel")}
        />
      </div>
    </div>
  );
}
