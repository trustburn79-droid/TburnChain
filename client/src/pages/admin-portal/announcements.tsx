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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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

export default function AnnouncementsManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const announcements: Announcement[] = [
    {
      id: "ANN-001",
      title: "Scheduled Maintenance: December 10th",
      content: "We will be performing scheduled maintenance on December 10th from 2:00 AM to 4:00 AM UTC. During this time, the admin portal will be temporarily unavailable.",
      type: "maintenance",
      audience: ["All Users"],
      status: "published",
      pinned: true,
      publishedAt: "2024-12-03T10:00:00Z",
      scheduledFor: null,
      author: "System Admin",
      views: 245
    },
    {
      id: "ANN-002",
      title: "New Feature: Custom Dashboards",
      content: "We're excited to announce the launch of custom dashboards! You can now create personalized dashboards with your preferred widgets and layouts.",
      type: "info",
      audience: ["All Users"],
      status: "published",
      pinned: false,
      publishedAt: "2024-12-01T14:30:00Z",
      scheduledFor: null,
      author: "Product Team",
      views: 189
    },
    {
      id: "ANN-003",
      title: "Security Advisory: Update Your 2FA",
      content: "We recommend all users to review and update their 2FA settings. New hardware security key support is now available.",
      type: "warning",
      audience: ["Administrators", "Security Team"],
      status: "published",
      pinned: true,
      publishedAt: "2024-11-28T09:00:00Z",
      scheduledFor: null,
      author: "Security Team",
      views: 156
    },
    {
      id: "ANN-004",
      title: "API Rate Limit Changes",
      content: "Starting January 1st, 2025, we will be updating our API rate limits. Please review the new limits in the API documentation.",
      type: "info",
      audience: ["Developers"],
      status: "scheduled",
      pinned: false,
      publishedAt: null,
      scheduledFor: "2024-12-15T09:00:00Z",
      author: "API Team",
      views: 0
    },
    {
      id: "ANN-005",
      title: "Critical: Bridge Service Incident",
      content: "We are currently investigating an issue with the cross-chain bridge service. Updates will be provided shortly.",
      type: "critical",
      audience: ["All Users"],
      status: "archived",
      pinned: false,
      publishedAt: "2024-11-20T16:00:00Z",
      scheduledFor: null,
      author: "Operations",
      views: 892
    },
    {
      id: "ANN-006",
      title: "Holiday Support Hours",
      content: "Our support team will be operating on reduced hours during the holiday season. Emergency support will still be available 24/7.",
      type: "info",
      audience: ["All Users"],
      status: "draft",
      pinned: false,
      publishedAt: null,
      scheduledFor: null,
      author: "Support Team",
      views: 0
    },
  ];

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "info": return <Badge className="bg-blue-500">Info</Badge>;
      case "warning": return <Badge className="bg-yellow-500">Warning</Badge>;
      case "critical": return <Badge className="bg-red-500">Critical</Badge>;
      case "maintenance": return <Badge className="bg-purple-500">Maintenance</Badge>;
      default: return <Badge>{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published": return <Badge className="bg-green-500">Published</Badge>;
      case "scheduled": return <Badge variant="secondary">Scheduled</Badge>;
      case "draft": return <Badge variant="outline">Draft</Badge>;
      case "archived": return <Badge variant="outline" className="opacity-50">Archived</Badge>;
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

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Bell className="h-8 w-8" />
              Announcements
            </h1>
            <p className="text-muted-foreground">Manage and publish announcements to users</p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-new-announcement">
                  <Plus className="h-4 w-4 mr-2" />
                  New Announcement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Announcement</DialogTitle>
                  <DialogDescription>Create a new announcement for users</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input placeholder="Announcement title" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select defaultValue="info">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">Info</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Audience</Label>
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Users</SelectItem>
                          <SelectItem value="admins">Administrators</SelectItem>
                          <SelectItem value="developers">Developers</SelectItem>
                          <SelectItem value="security">Security Team</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Content</Label>
                    <Textarea placeholder="Write your announcement..." rows={5} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch id="pin-announcement" />
                      <Label htmlFor="pin-announcement">Pin to top</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch id="notify-email" />
                      <Label htmlFor="notify-email">Send email notification</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Schedule (optional)</Label>
                    <Input type="datetime-local" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Save Draft</Button>
                  <Button onClick={() => setIsCreateDialogOpen(false)}>
                    <Send className="h-4 w-4 mr-2" />
                    Publish
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Published</p>
                  <p className="text-2xl font-bold">{publishedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Scheduled</p>
                  <p className="text-2xl font-bold">{scheduledCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Edit className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Drafts</p>
                  <p className="text-2xl font-bold">{draftCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Eye className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold">{totalViews}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="published">Published</TabsTrigger>
                  <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                  <TabsTrigger value="draft">Drafts</TabsTrigger>
                  <TabsTrigger value="archived">Archived</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search announcements..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-32" data-testid="select-type">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
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
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnnouncements.map((ann) => (
                  <TableRow key={ann.id}>
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
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {ann.status !== "archived" && (
                          <Button variant="ghost" size="icon">
                            <Archive className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="text-destructive">
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pin className="h-5 w-5" />
                Pinned Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.filter(a => a.pinned && a.status === "published").map((ann) => (
                  <div key={ann.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          {getTypeBadge(ann.type)}
                          <span className="font-medium">{ann.title}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{ann.content}</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Pin className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Upcoming Scheduled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.filter(a => a.status === "scheduled").map((ann) => (
                  <div key={ann.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          {getTypeBadge(ann.type)}
                          <span className="font-medium">{ann.title}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Scheduled for: {ann.scheduledFor && new Date(ann.scheduledFor).toLocaleString()}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Send className="h-3 w-3 mr-1" />
                        Publish Now
                      </Button>
                    </div>
                  </div>
                ))}
                {announcements.filter(a => a.status === "scheduled").length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No scheduled announcements</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
