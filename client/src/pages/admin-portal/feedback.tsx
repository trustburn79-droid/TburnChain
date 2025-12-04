import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Star,
  Search,
  Filter,
  Download,
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

export default function FeedbackSystem() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");

  const feedbackItems: FeedbackItem[] = [
    { id: "FB-001", type: "suggestion", category: "Dashboard", message: "It would be great to have customizable widgets on the dashboard", rating: 4, user: "admin@tburn.io", createdAt: "2024-12-03T10:00:00Z", status: "new", response: null },
    { id: "FB-002", type: "praise", category: "Performance", message: "The new real-time monitoring is fantastic! Great improvement.", rating: 5, user: "ops@tburn.io", createdAt: "2024-12-02T15:30:00Z", status: "reviewed", response: "Thank you for the positive feedback!" },
    { id: "FB-003", type: "bug", category: "Alerts", message: "Alert notifications sometimes arrive late", rating: 2, user: "security@tburn.io", createdAt: "2024-12-02T09:15:00Z", status: "actioned", response: "We've identified and fixed the delay issue." },
    { id: "FB-004", type: "complaint", category: "Documentation", message: "API documentation is outdated and missing examples", rating: 2, user: "dev@tburn.io", createdAt: "2024-12-01T14:00:00Z", status: "actioned", response: "Documentation update is in progress." },
    { id: "FB-005", type: "suggestion", category: "Security", message: "Add support for hardware security keys for 2FA", rating: 4, user: "analyst@tburn.io", createdAt: "2024-11-30T11:20:00Z", status: "reviewed", response: null },
    { id: "FB-006", type: "praise", category: "UI/UX", message: "Love the new dark mode implementation", rating: 5, user: "designer@tburn.io", createdAt: "2024-11-28T16:45:00Z", status: "archived", response: "Glad you like it!" },
  ];

  const ratingData = [
    { rating: "5 Stars", count: 45, percentage: 35 },
    { rating: "4 Stars", count: 38, percentage: 30 },
    { rating: "3 Stars", count: 25, percentage: 20 },
    { rating: "2 Stars", count: 12, percentage: 9 },
    { rating: "1 Star", count: 8, percentage: 6 },
  ];

  const typeDistribution = [
    { name: "Suggestions", value: 40, color: "hsl(var(--chart-1))" },
    { name: "Praise", value: 30, color: "hsl(var(--chart-2))" },
    { name: "Bugs", value: 20, color: "hsl(var(--chart-3))" },
    { name: "Complaints", value: 10, color: "hsl(var(--chart-5))" },
  ];

  const trendData = Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i + 1}`,
    feedback: Math.floor(Math.random() * 10) + 5,
    avgRating: 3 + Math.random() * 2,
  }));

  const avgRating = (feedbackItems.reduce((sum, f) => sum + f.rating, 0) / feedbackItems.length).toFixed(1);
  const newCount = feedbackItems.filter(f => f.status === "new").length;
  const responseRate = ((feedbackItems.filter(f => f.response).length / feedbackItems.length) * 100).toFixed(0);

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "suggestion": return <Badge className="bg-blue-500">Suggestion</Badge>;
      case "praise": return <Badge className="bg-green-500">Praise</Badge>;
      case "bug": return <Badge className="bg-orange-500">Bug</Badge>;
      case "complaint": return <Badge className="bg-red-500">Complaint</Badge>;
      default: return <Badge>{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new": return <Badge variant="outline" className="text-blue-500 border-blue-500">New</Badge>;
      case "reviewed": return <Badge variant="secondary">Reviewed</Badge>;
      case "actioned": return <Badge className="bg-green-500">Actioned</Badge>;
      case "archived": return <Badge variant="outline">Archived</Badge>;
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

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <MessageSquare className="h-8 w-8" />
              Feedback System
            </h1>
            <p className="text-muted-foreground">Collect and analyze user feedback</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                  <p className="text-2xl font-bold">{avgRating}/5</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Feedback</p>
                  <p className="text-2xl font-bold">{feedbackItems.length}</p>
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
                  <p className="text-sm text-muted-foreground">Response Rate</p>
                  <p className="text-2xl font-bold text-green-500">{responseRate}%</p>
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
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{newCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="feedback">All Feedback</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Feedback Trend</CardTitle>
                  <CardDescription>Daily feedback count and average rating</CardDescription>
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
                        <Bar yAxisId="left" dataKey="feedback" fill="hsl(var(--chart-1))" name="Feedback Count" />
                        <Line yAxisId="right" type="monotone" dataKey="avgRating" stroke="hsl(var(--chart-2))" name="Avg Rating" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Type Distribution</CardTitle>
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
                    {typeDistribution.map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
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

            <Card>
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ratingData.map((item) => (
                    <div key={item.rating} className="flex items-center gap-4">
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
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle>All Feedback</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search feedback..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        data-testid="input-search"
                      />
                    </div>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="w-32" data-testid="select-type">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="suggestion">Suggestions</SelectItem>
                        <SelectItem value="praise">Praise</SelectItem>
                        <SelectItem value="bug">Bugs</SelectItem>
                        <SelectItem value="complaint">Complaints</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFeedback.map((item) => (
                      <TableRow key={item.id}>
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
                          {new Date(item.createdAt).toLocaleDateString()}
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
              <Card>
                <CardHeader>
                  <CardTitle>Category Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {["Dashboard", "Performance", "Alerts", "Documentation", "Security", "UI/UX"].map((cat) => (
                      <div key={cat} className="flex items-center justify-between p-3 border rounded-lg">
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

              <Card>
                <CardHeader>
                  <CardTitle>Top Issues</CardTitle>
                  <CardDescription>Most mentioned concerns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { issue: "Dashboard loading speed", mentions: 15 },
                      { issue: "Alert notification delays", mentions: 12 },
                      { issue: "API documentation", mentions: 10 },
                      { issue: "Mobile responsiveness", mentions: 8 },
                      { issue: "Search functionality", mentions: 6 },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm">{item.issue}</span>
                        <Badge variant="secondary">{item.mentions} mentions</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
