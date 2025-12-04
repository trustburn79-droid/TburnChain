import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { queryClient, apiRequest } from "@/lib/queryClient";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
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
  Download,
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

interface CommunityData {
  posts: CommunityPost[];
  members: CommunityMember[];
  stats: {
    totalMembers: number;
    activePosts: number;
    flaggedContent: number;
    communityScore: number;
    weeklyGrowth: number;
  };
}

function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  change, 
  changeType = "neutral",
  isLoading,
  bgColor = "bg-primary/10",
  iconColor = "text-primary",
  testId
}: {
  icon: any;
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  isLoading?: boolean;
  bgColor?: string;
  iconColor?: string;
  testId: string;
}) {
  const changeColors = {
    positive: "text-green-500",
    negative: "text-red-500",
    neutral: "text-muted-foreground"
  };

  if (isLoading) {
    return (
      <Card data-testid={testId}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-2 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-1" />
          <Skeleton className="h-3 w-16" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid={testId}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-2 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <div className={`p-2 rounded-full ${bgColor}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={`text-xs ${changeColors[changeType]}`}>{change}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function CommunityManagement() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("posts");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false);

  const { data, isLoading, error, refetch } = useQuery<CommunityData>({
    queryKey: ['/api/admin/community'],
    refetchInterval: 30000,
  });

  const sendAnnouncementMutation = useMutation({
    mutationFn: async (announcement: { title: string; message: string; audience: string }) => {
      const response = await apiRequest("POST", "/api/admin/community/announcements", announcement);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/community'] });
      setIsAnnouncementDialogOpen(false);
      toast({
        title: t("adminCommunity.announcementSent"),
        description: t("adminCommunity.announcementSentDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminCommunity.error"),
        description: t("adminCommunity.announcementError"),
        variant: "destructive",
      });
    },
  });

  const moderatePostMutation = useMutation({
    mutationFn: async ({ postId, action }: { postId: string; action: "approve" | "remove" }) => {
      const response = await apiRequest("POST", `/api/admin/community/posts/${postId}/${action}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/community'] });
      toast({
        title: t("adminCommunity.postModerated"),
        description: t("adminCommunity.postModeratedDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminCommunity.error"),
        description: t("adminCommunity.moderationError"),
        variant: "destructive",
      });
    },
  });

  const banMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const response = await apiRequest("POST", `/api/admin/community/members/${memberId}/ban`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/community'] });
      toast({
        title: t("adminCommunity.memberBanned"),
        description: t("adminCommunity.memberBannedDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("adminCommunity.error"),
        description: t("adminCommunity.banError"),
        variant: "destructive",
      });
    },
  });

  const handleRefresh = useCallback(() => {
    refetch();
    toast({
      title: t("adminCommunity.refreshed"),
      description: t("adminCommunity.refreshedDesc"),
    });
  }, [refetch, toast, t]);

  const handleExport = useCallback(() => {
    const exportData = {
      posts: posts,
      members: members,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `community_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: t("adminCommunity.exported"),
      description: t("adminCommunity.exportedDesc"),
    });
  }, [toast, t]);

  const posts: CommunityPost[] = data?.posts || [
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

  const members: CommunityMember[] = data?.members || [
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

  const totalMembers = data?.stats?.totalMembers || 24847;
  const activePosts = data?.stats?.activePosts || 1256;
  const flaggedContent = data?.stats?.flaggedContent || 12;
  const communityScore = data?.stats?.communityScore || 94.5;
  const weeklyGrowth = data?.stats?.weeklyGrowth || 342;

  if (error) {
    return (
      <div className="flex-1 overflow-auto" data-testid="community-error">
        <div className="container max-w-[1800px] mx-auto p-6">
          <Card className="border-red-500/50 bg-red-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="h-5 w-5" />
                <span>{t("adminCommunity.loadError")}</span>
              </div>
              <Button onClick={() => refetch()} className="mt-4" data-testid="button-retry">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("adminCommunity.retry")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" data-testid="community-page">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" data-testid="text-community-title">
              <Users className="h-8 w-8" />
              {t("adminCommunity.title")}
            </h1>
            <p className="text-muted-foreground" data-testid="text-community-subtitle">
              {t("adminCommunity.subtitleKo")} | {t("adminCommunity.subtitleEn")}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Dialog open={isAnnouncementDialogOpen} onOpenChange={setIsAnnouncementDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-send-announcement">
                  <Send className="h-4 w-4 mr-2" />
                  {t("adminCommunity.sendAnnouncement")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("adminCommunity.sendAnnouncementTitle")}</DialogTitle>
                  <DialogDescription>{t("adminCommunity.sendAnnouncementDesc")}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t("adminCommunity.announcementTitle")}</Label>
                    <Input placeholder={t("adminCommunity.enterTitle")} data-testid="input-announcement-title" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adminCommunity.message")}</Label>
                    <Textarea placeholder={t("adminCommunity.enterMessage")} className="h-32" data-testid="input-announcement-message" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("adminCommunity.targetAudience")}</Label>
                    <Select defaultValue="all">
                      <SelectTrigger data-testid="select-audience">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("adminCommunity.allMembers")}</SelectItem>
                        <SelectItem value="whale">{t("adminCommunity.whaleTier")}</SelectItem>
                        <SelectItem value="large">{t("adminCommunity.largeTierPlus")}</SelectItem>
                        <SelectItem value="validators">{t("adminCommunity.validators")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => sendAnnouncementMutation.mutate({ title: "", message: "", audience: "all" })}
                    disabled={sendAnnouncementMutation.isPending}
                    data-testid="button-submit-announcement"
                  >
                    {sendAnnouncementMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    {t("adminCommunity.sendAnnouncementBtn")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={handleExport} data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              {t("adminCommunity.export")}
            </Button>
            <Button variant="outline" onClick={handleRefresh} data-testid="button-refresh">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("adminCommunity.refresh")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={Users}
            label={t("adminCommunity.totalMembers")}
            value={totalMembers.toLocaleString()}
            change={`+${weeklyGrowth} ${t("adminCommunity.thisWeek")}`}
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-primary/10"
            iconColor="text-primary"
            testId="card-total-members"
          />
          <MetricCard
            icon={MessageSquare}
            label={t("adminCommunity.activePosts")}
            value={activePosts.toLocaleString()}
            change={t("adminCommunity.last30Days")}
            isLoading={isLoading}
            bgColor="bg-blue-500/10"
            iconColor="text-blue-500"
            testId="card-active-posts"
          />
          <MetricCard
            icon={Flag}
            label={t("adminCommunity.flaggedContent")}
            value={flaggedContent}
            change={t("adminCommunity.pendingReview")}
            changeType="negative"
            isLoading={isLoading}
            bgColor="bg-yellow-500/10"
            iconColor="text-yellow-500"
            testId="card-flagged-content"
          />
          <MetricCard
            icon={Star}
            label={t("adminCommunity.communityScore")}
            value={communityScore}
            change={t("adminCommunity.excellentHealth")}
            changeType="positive"
            isLoading={isLoading}
            bgColor="bg-green-500/10"
            iconColor="text-green-500"
            testId="card-community-score"
          />
        </div>

        <Card data-testid="card-search">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("adminCommunity.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search"
              />
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList data-testid="tabs-community">
            <TabsTrigger value="posts" data-testid="tab-posts">{t("adminCommunity.posts")}</TabsTrigger>
            <TabsTrigger value="members" data-testid="tab-members">{t("adminCommunity.members")}</TabsTrigger>
            <TabsTrigger value="moderation" data-testid="tab-moderation">{t("adminCommunity.moderationQueue")}</TabsTrigger>
            <TabsTrigger value="leaderboard" data-testid="tab-leaderboard">{t("adminCommunity.leaderboard")}</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4">
            <Card data-testid="card-posts">
              <CardHeader>
                <CardTitle>{t("adminCommunity.recentPosts")}</CardTitle>
                <CardDescription>{t("adminCommunity.recentPostsDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-32" />
                    ))}
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {posts.map((post) => (
                        <div key={post.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors" data-testid={`post-item-${post.id}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={post.author.avatar} />
                                <AvatarFallback>{post.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium" data-testid={`text-author-${post.id}`}>{post.author.name}</span>
                                  <Badge className={getTierColor(post.author.tier)} data-testid={`badge-tier-${post.id}`}>{post.author.tier}</Badge>
                                  <Badge variant="outline" data-testid={`badge-category-${post.id}`}>{post.category}</Badge>
                                  <Badge className={getStatusColor(post.status)} data-testid={`badge-status-${post.id}`}>{post.status}</Badge>
                                </div>
                                <h3 className="font-medium mt-1" data-testid={`text-post-title-${post.id}`}>{post.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2" data-testid={`text-content-${post.id}`}>{post.content}</p>
                                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1" data-testid={`text-likes-${post.id}`}>
                                    <Heart className="h-4 w-4" />
                                    {post.likes}
                                  </span>
                                  <span className="flex items-center gap-1" data-testid={`text-comments-${post.id}`}>
                                    <MessageSquare className="h-4 w-4" />
                                    {post.comments}
                                  </span>
                                  <span className="flex items-center gap-1" data-testid={`text-date-${post.id}`}>
                                    <Calendar className="h-4 w-4" />
                                    {post.createdAt}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" data-testid={`button-view-post-${post.id}`}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" data-testid={`button-flag-post-${post.id}`}>
                                <Flag className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-red-500"
                                onClick={() => moderatePostMutation.mutate({ postId: post.id, action: "remove" })}
                                disabled={moderatePostMutation.isPending}
                                data-testid={`button-remove-post-${post.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <Card data-testid="card-members">
              <CardHeader>
                <CardTitle>{t("adminCommunity.communityMembers")}</CardTitle>
                <CardDescription>{t("adminCommunity.communityMembersDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("adminCommunity.member")}</TableHead>
                        <TableHead>{t("adminCommunity.tier")}</TableHead>
                        <TableHead>{t("adminCommunity.postsCount")}</TableHead>
                        <TableHead>{t("adminCommunity.reputation")}</TableHead>
                        <TableHead>{t("adminCommunity.joined")}</TableHead>
                        <TableHead>{t("adminCommunity.status")}</TableHead>
                        <TableHead>{t("adminCommunity.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map((member) => (
                        <TableRow key={member.id} data-testid={`row-member-${member.id}`}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium" data-testid={`text-member-name-${member.id}`}>{member.name}</p>
                                <p className="text-xs text-muted-foreground font-mono" data-testid={`text-member-address-${member.id}`}>{member.address}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getTierColor(member.tier)} data-testid={`badge-member-tier-${member.id}`}>{member.tier}</Badge>
                          </TableCell>
                          <TableCell data-testid={`text-member-posts-${member.id}`}>{member.posts}</TableCell>
                          <TableCell>
                            <span className={member.reputation >= 0 ? "text-green-500" : "text-red-500"} data-testid={`text-reputation-${member.id}`}>
                              {member.reputation >= 0 ? "+" : ""}{member.reputation}
                            </span>
                          </TableCell>
                          <TableCell data-testid={`text-joined-${member.id}`}>{member.joinedAt}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(member.status)} data-testid={`badge-member-status-${member.id}`}>{member.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" data-testid={`button-view-member-${member.id}`}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" data-testid={`button-warn-member-${member.id}`}>
                                <AlertTriangle className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-red-500"
                                onClick={() => banMemberMutation.mutate(member.id)}
                                disabled={banMemberMutation.isPending}
                                data-testid={`button-ban-member-${member.id}`}
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="moderation" className="space-y-4">
            <Card data-testid="card-moderation">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  {t("adminCommunity.moderationQueueTitle")}
                </CardTitle>
                <CardDescription>{t("adminCommunity.moderationQueueDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-32" />
                  </div>
                ) : (
                  posts.filter(p => p.status === "flagged").map((post) => (
                    <div key={post.id} className="p-4 border border-yellow-500/30 rounded-lg bg-yellow-500/5" data-testid={`flagged-post-${post.id}`}>
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline">{post.category}</Badge>
                            <span className="font-medium">{post.title}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">{post.content}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {t("adminCommunity.flaggedFor")}: {t("adminCommunity.potentialSecurityDisclosure")}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => moderatePostMutation.mutate({ postId: post.id, action: "approve" })}
                            disabled={moderatePostMutation.isPending}
                            data-testid={`button-approve-${post.id}`}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {t("adminCommunity.approve")}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => moderatePostMutation.mutate({ postId: post.id, action: "remove" })}
                            disabled={moderatePostMutation.isPending}
                            data-testid={`button-remove-flagged-${post.id}`}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            {t("adminCommunity.remove")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {!isLoading && posts.filter(p => p.status === "flagged").length === 0 && (
                  <div className="text-center py-8 text-muted-foreground" data-testid="text-no-flagged">
                    {t("adminCommunity.noFlaggedContent")}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            <Card data-testid="card-leaderboard">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  {t("adminCommunity.communityLeaderboard")}
                </CardTitle>
                <CardDescription>{t("adminCommunity.communityLeaderboardDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("adminCommunity.rank")}</TableHead>
                        <TableHead>{t("adminCommunity.member")}</TableHead>
                        <TableHead>{t("adminCommunity.reputation")}</TableHead>
                        <TableHead>{t("adminCommunity.postsCount")}</TableHead>
                        <TableHead>{t("adminCommunity.tier")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members
                        .filter(m => m.status !== "banned")
                        .sort((a, b) => b.reputation - a.reputation)
                        .map((member, index) => (
                          <TableRow key={member.id} data-testid={`row-leaderboard-${index}`}>
                            <TableCell>
                              <div className="flex items-center gap-2" data-testid={`rank-${index}`}>
                                {index === 0 && <span className="text-lg font-bold text-yellow-500">#1</span>}
                                {index === 1 && <span className="text-lg font-bold text-gray-400">#2</span>}
                                {index === 2 && <span className="text-lg font-bold text-amber-600">#3</span>}
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
                            <TableCell className="text-green-500 font-bold" data-testid={`leaderboard-reputation-${index}`}>+{member.reputation}</TableCell>
                            <TableCell data-testid={`leaderboard-posts-${index}`}>{member.posts}</TableCell>
                            <TableCell>
                              <Badge className={getTierColor(member.tier)}>{member.tier}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
