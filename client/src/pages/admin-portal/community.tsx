import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users,
  MessageSquare,
  Heart,
  Star,
  Search,
  RefreshCw,
  Plus,
  Send,
  Flag,
  Ban,
  Award,
  TrendingUp,
  Eye,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Calendar,
} from "lucide-react";

interface CommunityPost {
  id: string;
  author: {
    name: string;
    address: string;
    avatar?: string;
    tier: string;
  };
  title: string;
  content: string;
  category: string;
  likes: number;
  comments: number;
  createdAt: string;
  status: "published" | "flagged" | "removed";
}

interface CommunityMember {
  id: string;
  name: string;
  address: string;
  tier: string;
  posts: number;
  reputation: number;
  joinedAt: string;
  status: "active" | "warned" | "banned";
}

export default function CommunityManagement() {
  const [activeTab, setActiveTab] = useState("posts");
  const [searchQuery, setSearchQuery] = useState("");

  const posts: CommunityPost[] = [
    {
      id: "1",
      author: { name: "CryptoWhale", address: "0x1234...5678", tier: "Whale" },
      title: "Proposal Discussion: Block Gas Increase",
      content: "I think increasing the block gas limit is a great idea for network scalability...",
      category: "Governance",
      likes: 245,
      comments: 67,
      createdAt: "2024-12-04 12:30:00",
      status: "published",
    },
    {
      id: "2",
      author: { name: "DeFiDev", address: "0xabcd...efgh", tier: "Large" },
      title: "Guide: Staking Optimization Strategies",
      content: "Here's my comprehensive guide on how to maximize your staking rewards...",
      category: "Education",
      likes: 189,
      comments: 34,
      createdAt: "2024-12-03 18:45:00",
      status: "published",
    },
    {
      id: "3",
      author: { name: "AnonymousUser", address: "0x9999...0000", tier: "Small" },
      title: "Potential Security Issue",
      content: "I found a potential vulnerability in the bridge contract...",
      category: "Security",
      likes: 12,
      comments: 89,
      createdAt: "2024-12-04 08:15:00",
      status: "flagged",
    },
  ];

  const members: CommunityMember[] = [
    {
      id: "1",
      name: "CryptoWhale",
      address: "0x1234...5678",
      tier: "Whale",
      posts: 156,
      reputation: 4850,
      joinedAt: "2024-01-15",
      status: "active",
    },
    {
      id: "2",
      name: "DeFiDev",
      address: "0xabcd...efgh",
      tier: "Large",
      posts: 89,
      reputation: 2340,
      joinedAt: "2024-02-20",
      status: "active",
    },
    {
      id: "3",
      name: "SpamBot123",
      address: "0xdead...beef",
      tier: "Small",
      posts: 45,
      reputation: -120,
      joinedAt: "2024-11-01",
      status: "banned",
    },
    {
      id: "4",
      name: "NewUser99",
      address: "0x7777...8888",
      tier: "Small",
      posts: 3,
      reputation: 15,
      joinedAt: "2024-12-01",
      status: "active",
    },
  ];

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case "whale":
        return "bg-purple-500";
      case "large":
        return "bg-blue-500";
      case "medium":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
      case "active":
        return "bg-green-500";
      case "flagged":
      case "warned":
        return "bg-yellow-500";
      case "removed":
      case "banned":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Users className="h-8 w-8" />
              Community Management
            </h1>
            <p className="text-muted-foreground">커뮤니티 관리 | Manage community members and content</p>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button data-testid="button-send-announcement">
                  <Send className="h-4 w-4 mr-2" />
                  Send Announcement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Announcement</DialogTitle>
                  <DialogDescription>Broadcast a message to the community</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input placeholder="Announcement title" />
                  </div>
                  <div className="space-y-2">
                    <Label>Message</Label>
                    <Textarea placeholder="Your announcement..." className="h-32" />
                  </div>
                  <div className="space-y-2">
                    <Label>Target Audience</Label>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Members</SelectItem>
                        <SelectItem value="whale">Whale Tier</SelectItem>
                        <SelectItem value="large">Large Tier+</SelectItem>
                        <SelectItem value="validators">Validators</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full">Send Announcement</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={() => window.location.reload()} data-testid="button-refresh">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24,847</div>
              <p className="text-xs text-green-500">+342 this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Posts</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,256</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Flagged Content</CardTitle>
              <Flag className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">12</div>
              <p className="text-xs text-muted-foreground">Pending review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Community Score</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94.5</div>
              <p className="text-xs text-green-500">Excellent health</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts or members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="moderation">Moderation Queue</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Posts</CardTitle>
                <CardDescription>Community discussions and content</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div key={post.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={post.author.avatar} />
                              <AvatarFallback>{post.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{post.author.name}</span>
                                <Badge className={getTierColor(post.author.tier)}>{post.author.tier}</Badge>
                                <Badge variant="outline">{post.category}</Badge>
                                <Badge className={getStatusColor(post.status)}>{post.status}</Badge>
                              </div>
                              <h3 className="font-medium mt-1">{post.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.content}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Heart className="h-4 w-4" />
                                  {post.likes}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="h-4 w-4" />
                                  {post.comments}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {post.createdAt}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Flag className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-500">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Community Members</CardTitle>
                <CardDescription>Manage member accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Posts</TableHead>
                      <TableHead>Reputation</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-xs text-muted-foreground font-mono">{member.address}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getTierColor(member.tier)}>{member.tier}</Badge>
                        </TableCell>
                        <TableCell>{member.posts}</TableCell>
                        <TableCell>
                          <span className={member.reputation >= 0 ? "text-green-500" : "text-red-500"}>
                            {member.reputation >= 0 ? "+" : ""}{member.reputation}
                          </span>
                        </TableCell>
                        <TableCell>{member.joinedAt}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(member.status)}>{member.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <AlertTriangle className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-500">
                              <Ban className="h-4 w-4" />
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

          <TabsContent value="moderation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Moderation Queue
                </CardTitle>
                <CardDescription>Content requiring review</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {posts.filter(p => p.status === "flagged").map((post) => (
                  <div key={post.id} className="p-4 border border-yellow-500/30 rounded-lg bg-yellow-500/5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{post.category}</Badge>
                          <span className="font-medium">{post.title}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{post.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Flagged for: Potential security disclosure
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Community Leaderboard
                </CardTitle>
                <CardDescription>Top contributors and active members</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Reputation</TableHead>
                      <TableHead>Posts</TableHead>
                      <TableHead>Tier</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members
                      .filter(m => m.status !== "banned")
                      .sort((a, b) => b.reputation - a.reputation)
                      .map((member, index) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {index === 0 && <span className="text-2xl">🥇</span>}
                              {index === 1 && <span className="text-2xl">🥈</span>}
                              {index === 2 && <span className="text-2xl">🥉</span>}
                              {index > 2 && <span className="text-lg font-bold">#{index + 1}</span>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{member.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-green-500 font-bold">+{member.reputation}</TableCell>
                          <TableCell>{member.posts}</TableCell>
                          <TableCell>
                            <Badge className={getTierColor(member.tier)}>{member.tier}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
