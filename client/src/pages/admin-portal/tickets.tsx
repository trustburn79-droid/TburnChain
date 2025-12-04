import { useState } from "react";
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
import {
  Ticket,
  Plus,
  Search,
  Filter,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  User,
  RefreshCw,
  Paperclip,
  Send,
  ExternalLink,
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

export default function SupportTickets() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const tickets: SupportTicket[] = [
    { id: "TKT-001", title: "Unable to access validator management", description: "Permission denied error when trying to view validators", category: "Access Issue", priority: "high", status: "in-progress", requester: "admin@tburn.io", assignee: "support@tburn.io", createdAt: "2024-12-03T10:30:00Z", updatedAt: "2024-12-03T14:20:00Z", responses: 3 },
    { id: "TKT-002", title: "Dashboard not loading metrics", description: "Real-time metrics showing blank on dashboard", category: "Bug Report", priority: "critical", status: "open", requester: "ops@tburn.io", assignee: null, createdAt: "2024-12-03T09:15:00Z", updatedAt: "2024-12-03T09:15:00Z", responses: 0 },
    { id: "TKT-003", title: "Request for API documentation", description: "Need updated API docs for bridge integration", category: "Documentation", priority: "low", status: "resolved", requester: "dev@tburn.io", assignee: "support@tburn.io", createdAt: "2024-12-02T16:45:00Z", updatedAt: "2024-12-03T11:30:00Z", responses: 5 },
    { id: "TKT-004", title: "Alert notifications not working", description: "Not receiving email notifications for critical alerts", category: "Bug Report", priority: "high", status: "waiting", requester: "security@tburn.io", assignee: "support@tburn.io", createdAt: "2024-12-02T14:00:00Z", updatedAt: "2024-12-03T08:00:00Z", responses: 2 },
    { id: "TKT-005", title: "Feature request: Custom dashboards", description: "Would like ability to create personalized dashboards", category: "Feature Request", priority: "medium", status: "open", requester: "analyst@tburn.io", assignee: null, createdAt: "2024-12-01T11:20:00Z", updatedAt: "2024-12-01T11:20:00Z", responses: 1 },
    { id: "TKT-006", title: "Training session request", description: "Need training for new team members on security tools", category: "Training", priority: "medium", status: "closed", requester: "hr@tburn.io", assignee: "support@tburn.io", createdAt: "2024-11-28T09:00:00Z", updatedAt: "2024-12-01T16:00:00Z", responses: 8 },
  ];

  const ticketMessages: TicketMessage[] = [
    { id: "1", sender: "admin@tburn.io", isAdmin: false, message: "I'm getting a permission denied error when trying to access the validator management page.", timestamp: "2024-12-03T10:30:00Z" },
    { id: "2", sender: "Support Team", isAdmin: true, message: "Thank you for reporting this. Can you please confirm your role and when this started happening?", timestamp: "2024-12-03T11:45:00Z" },
    { id: "3", sender: "admin@tburn.io", isAdmin: false, message: "I have the Network Admin role. This started after the system update yesterday.", timestamp: "2024-12-03T12:30:00Z" },
    { id: "4", sender: "Support Team", isAdmin: true, message: "We've identified the issue. There was a permission mapping error in the last update. We're deploying a fix now.", timestamp: "2024-12-03T14:20:00Z" },
  ];

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical": return <Badge className="bg-red-500">Critical</Badge>;
      case "high": return <Badge className="bg-orange-500">High</Badge>;
      case "medium": return <Badge className="bg-yellow-500">Medium</Badge>;
      case "low": return <Badge className="bg-blue-500">Low</Badge>;
      default: return <Badge>{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open": return <Badge variant="outline" className="text-blue-500 border-blue-500">Open</Badge>;
      case "in-progress": return <Badge className="bg-purple-500">In Progress</Badge>;
      case "waiting": return <Badge variant="secondary">Waiting</Badge>;
      case "resolved": return <Badge className="bg-green-500">Resolved</Badge>;
      case "closed": return <Badge variant="outline">Closed</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || ticket.status === selectedStatus;
    const matchesPriority = selectedPriority === "all" || ticket.priority === selectedPriority;
    const matchesTab = activeTab === "all" || 
      (activeTab === "open" && (ticket.status === "open" || ticket.status === "in-progress" || ticket.status === "waiting")) ||
      (activeTab === "resolved" && (ticket.status === "resolved" || ticket.status === "closed"));
    return matchesSearch && matchesStatus && matchesPriority && matchesTab;
  });

  const openCount = tickets.filter(t => t.status === "open" || t.status === "in-progress" || t.status === "waiting").length;
  const criticalCount = tickets.filter(t => t.priority === "critical" && t.status !== "resolved" && t.status !== "closed").length;
  const avgResponseTime = "2.5h";

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Ticket className="h-8 w-8" />
              Support Tickets
            </h1>
            <p className="text-muted-foreground">Manage and respond to support requests</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" data-testid="button-refresh">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-new-ticket">
                  <Plus className="h-4 w-4 mr-2" />
                  New Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Support Ticket</DialogTitle>
                  <DialogDescription>Submit a new support request</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input placeholder="Brief description of the issue" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bug">Bug Report</SelectItem>
                          <SelectItem value="access">Access Issue</SelectItem>
                          <SelectItem value="feature">Feature Request</SelectItem>
                          <SelectItem value="docs">Documentation</SelectItem>
                          <SelectItem value="training">Training</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea placeholder="Provide detailed information about your issue..." rows={5} />
                  </div>
                  <div className="space-y-2">
                    <Label>Attachments</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      <Paperclip className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Drop files here or click to upload</p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                  <Button onClick={() => setIsCreateDialogOpen(false)}>Submit Ticket</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Ticket className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Open Tickets</p>
                  <p className="text-2xl font-bold">{openCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Critical</p>
                  <p className="text-2xl font-bold text-red-500">{criticalCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Resolved Today</p>
                  <p className="text-2xl font-bold text-green-500">3</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Response</p>
                  <p className="text-2xl font-bold">{avgResponseTime}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="open">Open</TabsTrigger>
                    <TabsTrigger value="resolved">Resolved</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="flex items-center gap-2">
                  <div className="relative w-48">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search"
                    />
                  </div>
                  <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                    <SelectTrigger className="w-32" data-testid="select-priority">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow 
                      key={ticket.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedTicket(ticket)}
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

          <Card>
            <CardHeader>
              <CardTitle>
                {selectedTicket ? `Ticket ${selectedTicket.id}` : "Select a Ticket"}
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
                      <span className="text-muted-foreground">Category</span>
                      <span>{selectedTicket.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Requester</span>
                      <span>{selectedTicket.requester}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Assignee</span>
                      <span>{selectedTicket.assignee || "Unassigned"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span>{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h5 className="font-medium mb-3">Conversation</h5>
                    <ScrollArea className="h-48">
                      <div className="space-y-3">
                        {ticketMessages.map((msg) => (
                          <div key={msg.id} className={`flex gap-2 ${msg.isAdmin ? "" : "flex-row-reverse"}`}>
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
                    <Input placeholder="Type a reply..." className="flex-1" />
                    <Button size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a ticket to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
