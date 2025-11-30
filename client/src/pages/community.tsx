import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  MessageSquare, 
  Trophy, 
  Star, 
  TrendingUp, 
  Calendar,
  Bell,
  Award,
  Target,
  Zap,
  Heart,
  Share2,
  BookOpen,
  Flame,
  Crown,
  Shield,
  Gift,
  CheckCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  Eye,
  ThumbsUp,
  MessageCircle,
  Send,
  Plus,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Globe,
  Sparkles,
  Activity,
  BarChart3,
  Coins,
  Vote,
  Loader2,
  CheckCircle2,
  XCircle,
  Mail,
  Wallet
} from "lucide-react";
import { useWebSocket } from "@/lib/websocket-context";

interface CommunityStats {
  totalMembers: number;
  activeMembers: number;
  totalPosts: number;
  totalComments: number;
  totalProposals: number;
  activeProposals: number;
  totalEvents: number;
  upcomingEvents: number;
  totalRewards: string;
  weeklyGrowth: number;
}

interface LeaderboardMember {
  id: string;
  rank: number;
  address: string;
  username: string;
  avatar?: string;
  reputation: number;
  contributions: number;
  badges: string[];
  level: number;
  tburnStaked: string;
  joinedDate: number;
  isOnline: boolean;
}

interface ForumPost {
  id: string;
  title: string;
  author: string;
  authorAvatar?: string;
  category: string;
  content: string;
  likes: number;
  comments: number;
  views: number;
  isPinned: boolean;
  isHot: boolean;
  createdAt: number;
  tags: string[];
}

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  type: 'ama' | 'workshop' | 'hackathon' | 'meetup' | 'airdrop' | 'competition';
  startDate: number;
  endDate: number;
  participants: number;
  maxParticipants?: number;
  rewards?: string;
  status: 'upcoming' | 'live' | 'ended';
  location?: string;
  isOnline: boolean;
  translationKey?: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'update' | 'news' | 'alert' | 'feature';
  createdAt: number;
  isImportant: boolean;
  translationKey?: string;
}

interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt?: number;
  progress?: number;
  translationKey?: string;
}

interface ActivityItem {
  id: string;
  type: 'post' | 'comment' | 'stake' | 'vote' | 'proposal' | 'badge' | 'reward';
  user: string;
  userAvatar?: string;
  action: string;
  target?: string;
  amount?: string;
  timestamp: number;
}

interface Comment {
  id: string;
  postId: string;
  author: string;
  content: string;
  likes: number;
  createdAt: number;
  isEdited?: boolean;
  replies?: Comment[];
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
};

const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp * 1000;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return i18n.t('community.time.justNow', 'Just now');
  if (minutes < 60) return i18n.t('community.time.minutesAgo', '{{count}}m ago', { count: minutes });
  if (hours < 24) return i18n.t('community.time.hoursAgo', '{{count}}h ago', { count: hours });
  if (days < 7) return i18n.t('community.time.daysAgo', '{{count}}d ago', { count: days });
  return new Date(timestamp * 1000).toLocaleDateString(i18n.language);
};

const categoryColors: Record<string, string> = {
  general: "bg-blue-500/20 text-blue-400",
  technical: "bg-purple-500/20 text-purple-400",
  governance: "bg-green-500/20 text-green-400",
  trading: "bg-yellow-500/20 text-yellow-400",
  support: "bg-red-500/20 text-red-400",
  announcements: "bg-orange-500/20 text-orange-400",
};

const eventTypeColors: Record<string, string> = {
  ama: "bg-purple-500/20 text-purple-400",
  workshop: "bg-blue-500/20 text-blue-400",
  hackathon: "bg-green-500/20 text-green-400",
  meetup: "bg-yellow-500/20 text-yellow-400",
  airdrop: "bg-pink-500/20 text-pink-400",
  competition: "bg-orange-500/20 text-orange-400",
};

const rarityColors: Record<string, string> = {
  common: "border-gray-500 bg-gray-500/10",
  rare: "border-blue-500 bg-blue-500/10",
  epic: "border-purple-500 bg-purple-500/10",
  legendary: "border-yellow-500 bg-yellow-500/10",
};

const badgeIcons: Record<string, JSX.Element> = {
  early_adopter: <Star className="h-4 w-4 text-yellow-400" />,
  validator: <Shield className="h-4 w-4 text-blue-400" />,
  contributor: <Award className="h-4 w-4 text-green-400" />,
  whale: <Coins className="h-4 w-4 text-purple-400" />,
  governance: <Vote className="h-4 w-4 text-orange-400" />,
  community: <Users className="h-4 w-4 text-pink-400" />,
};

// Generate a persistent user ID for this session
const getUserId = () => {
  let userId = localStorage.getItem('tburn_community_user_id');
  if (!userId) {
    userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('tburn_community_user_id', userId);
  }
  return userId;
};

export default function Community() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [newPostDialogOpen, setNewPostDialogOpen] = useState(false);
  const [eventRegisterDialogOpen, setEventRegisterDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CommunityEvent | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [dislikedPosts, setDislikedPosts] = useState<Set<string>>(new Set());
  const [registeredEvents, setRegisteredEvents] = useState<Set<string>>(new Set());
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [postDetailOpen, setPostDetailOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  
  // Form states
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postCategory, setPostCategory] = useState("general");
  const [postTags, setPostTags] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regWallet, setRegWallet] = useState("");
  const [regName, setRegName] = useState("");

  // WebSocket for real-time updates
  const { lastMessage } = useWebSocket();
  
  const userId = getUserId();

  // Community Stats Query
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<CommunityStats>({
    queryKey: ['/api/community/stats'],
    refetchInterval: 30000,
  });

  // Leaderboard Query
  const { data: leaderboard, isLoading: leaderboardLoading, refetch: refetchLeaderboard } = useQuery<LeaderboardMember[]>({
    queryKey: ['/api/community/leaderboard'],
    refetchInterval: 60000,
  });

  // Forum Posts Query
  const { data: posts, isLoading: postsLoading, refetch: refetchPosts } = useQuery<ForumPost[]>({
    queryKey: ['/api/community/posts', selectedCategory],
    refetchInterval: 30000,
  });

  // Events Query
  const { data: events, isLoading: eventsLoading, refetch: refetchEvents } = useQuery<CommunityEvent[]>({
    queryKey: ['/api/community/events'],
    refetchInterval: 60000,
  });

  // Announcements Query
  const { data: announcements, isLoading: announcementsLoading, refetch: refetchAnnouncements } = useQuery<Announcement[]>({
    queryKey: ['/api/community/announcements'],
    refetchInterval: 60000,
  });

  // Activity Feed Query
  const { data: activities, isLoading: activitiesLoading, refetch: refetchActivities } = useQuery<ActivityItem[]>({
    queryKey: ['/api/community/activity'],
    refetchInterval: 10000,
  });

  // Badges Query
  const { data: badges, isLoading: badgesLoading, refetch: refetchBadges } = useQuery<UserBadge[]>({
    queryKey: ['/api/community/badges'],
  });

  // Create Post Mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; category: string; tags: string; author: string }) => {
      const response = await apiRequest('/api/community/posts', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: t('community.toastPostCreated', 'Post Created'),
        description: t('community.toastPostCreatedDesc', 'Your post has been published successfully!'),
      });
      setNewPostDialogOpen(false);
      setPostTitle("");
      setPostContent("");
      setPostCategory("general");
      setPostTags("");
      queryClient.invalidateQueries({ queryKey: ['/api/community/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/community/activity'] });
    },
    onError: (error) => {
      toast({
        title: t('common.error', 'Error'),
        description: t('community.toastPostError', 'Failed to create post. Please try again.'),
        variant: "destructive",
      });
    },
  });

  // Like Post Mutation
  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiRequest(`/api/community/posts/${postId}/like`, {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });
      return response;
    },
    onSuccess: (data, postId) => {
      if (data.liked) {
        setLikedPosts(prev => new Set([...prev, postId]));
        setDislikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      } else {
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/community/posts'] });
    },
  });

  // Dislike Post Mutation
  const dislikePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiRequest(`/api/community/posts/${postId}/dislike`, {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });
      return response;
    },
    onSuccess: (data, postId) => {
      if (data.disliked) {
        setDislikedPosts(prev => new Set([...prev, postId]));
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      } else {
        setDislikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/community/posts'] });
    },
  });

  // Register for Event Mutation
  const registerEventMutation = useMutation({
    mutationFn: async (data: { eventId: string; userName: string; email: string; walletAddress: string }) => {
      const response = await apiRequest(`/api/community/events/${data.eventId}/register`, {
        method: 'POST',
        body: JSON.stringify({
          userId,
          userName: data.userName,
          email: data.email,
          walletAddress: data.walletAddress,
        }),
      });
      return response;
    },
    onSuccess: (data, variables) => {
      if (data.success) {
        setRegisteredEvents(prev => new Set([...prev, variables.eventId]));
        toast({
          title: t('community.toastRegistrationSuccess', 'Registration Successful!'),
          description: data.message || t('community.toastRegistrationSuccessDesc', 'You have been registered for the event.'),
        });
        setEventRegisterDialogOpen(false);
        setSelectedEvent(null);
        setRegEmail("");
        setRegWallet("");
        setRegName("");
        queryClient.invalidateQueries({ queryKey: ['/api/community/events'] });
        queryClient.invalidateQueries({ queryKey: ['/api/community/activity'] });
      } else {
        toast({
          title: t('community.toastAlreadyRegistered', 'Already Registered'),
          description: data.message || t('community.toastAlreadyRegisteredDesc', 'You are already registered for this event.'),
        });
      }
    },
    onError: (error) => {
      toast({
        title: t('community.toastRegistrationFailed', 'Registration Failed'),
        description: t('community.toastRegistrationFailedDesc', 'Unable to register for the event. Please try again.'),
        variant: "destructive",
      });
    },
  });

  // Join Live Event Mutation
  const joinEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await apiRequest(`/api/community/events/${eventId}/join`, {
        method: 'POST',
        body: JSON.stringify({ userId, userName: regName || "Anonymous" }),
      });
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: t('community.toastJoinedEvent', 'Joined Event'),
        description: t('community.toastJoinedEventDesc', 'You have joined the live event!'),
      });
    },
  });

  // Comment Mutation
  const createCommentMutation = useMutation({
    mutationFn: async ({ postId, content, parentCommentId }: { postId: string; content: string; parentCommentId?: string }) => {
      const response = await apiRequest(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({
          content,
          author: regName || "Anonymous",
          authorId: userId,
          authorAddress: regWallet || "",
          parentCommentId,
        }),
      });
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: t('community.toastCommentPosted', 'Comment Posted'),
        description: t('community.toastCommentPostedDesc', 'Your comment has been added.'),
      });
      setNewComment("");
      setReplyContent("");
      setReplyingTo(null);
      if (selectedPost) {
        fetchComments(selectedPost.id);
      }
    },
    onError: () => {
      toast({
        title: t('community.toastCommentFailed', 'Failed'),
        description: t('community.toastCommentFailedDesc', 'Unable to post comment. Please try again.'),
        variant: "destructive",
      });
    },
  });

  // Like Comment Mutation
  const likeCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const response = await apiRequest(`/api/community/comments/${commentId}/like`, {
        method: 'POST',
        body: JSON.stringify({ userId, userAddress: regWallet || "" }),
      });
      return response;
    },
    onSuccess: (data) => {
      if (selectedPost) {
        fetchComments(selectedPost.id);
      }
    },
  });

  // Fetch comments for a post
  const fetchComments = useCallback(async (postId: string) => {
    try {
      const response = await fetch(`/api/community/posts/${postId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  }, []);

  // Open post detail
  const openPostDetail = useCallback((post: ForumPost) => {
    setSelectedPost(post);
    setPostDetailOpen(true);
    fetchComments(post.id);
  }, [fetchComments]);

  // Handle comment submission
  const handleSubmitComment = () => {
    if (!selectedPost || !newComment.trim()) return;
    createCommentMutation.mutate({
      postId: selectedPost.id,
      content: newComment,
    });
  };

  // Handle reply submission
  const handleSubmitReply = (parentCommentId: string) => {
    if (!selectedPost || !replyContent.trim()) return;
    createCommentMutation.mutate({
      postId: selectedPost.id,
      content: replyContent,
      parentCommentId,
    });
  };

  // Refresh all data
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchStats(),
        refetchLeaderboard(),
        refetchPosts(),
        refetchEvents(),
        refetchAnnouncements(),
        refetchActivities(),
        refetchBadges(),
      ]);
      toast({
        title: t('community.toastRefreshed', 'Refreshed'),
        description: t('community.toastRefreshedDesc', 'All community data has been updated.'),
      });
    } catch (error) {
      toast({
        title: t('community.toastRefreshFailed', 'Refresh Failed'),
        description: t('community.toastRefreshFailedDesc', 'Unable to refresh data. Please try again.'),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchStats, refetchLeaderboard, refetchPosts, refetchEvents, refetchAnnouncements, refetchActivities, refetchBadges, toast]);

  // Handle post submission
  const handleSubmitPost = () => {
    if (!postTitle.trim() || !postContent.trim()) {
      toast({
        title: t('community.toastValidationError', 'Validation Error'),
        description: t('community.toastValidationErrorDesc', 'Please fill in both title and content.'),
        variant: "destructive",
      });
      return;
    }
    createPostMutation.mutate({
      title: postTitle,
      content: postContent,
      category: postCategory,
      tags: postTags,
      author: regName || "Anonymous",
    });
  };

  // Handle event registration
  const handleEventRegister = () => {
    if (!selectedEvent) return;
    if (!regEmail.trim()) {
      toast({
        title: t('community.toastEmailRequired', 'Email Required'),
        description: t('community.toastEmailRequiredDesc', 'Please enter your email address.'),
        variant: "destructive",
      });
      return;
    }
    registerEventMutation.mutate({
      eventId: selectedEvent.id,
      userName: regName || "Anonymous",
      email: regEmail,
      walletAddress: regWallet,
    });
  };

  // Open event registration dialog
  const openEventRegistration = (event: CommunityEvent) => {
    setSelectedEvent(event);
    setEventRegisterDialogOpen(true);
  };

  // Mock data for demo
  const mockStats: CommunityStats = {
    totalMembers: 125847,
    activeMembers: 45623,
    totalPosts: 89456,
    totalComments: 456789,
    totalProposals: 234,
    activeProposals: 12,
    totalEvents: 156,
    upcomingEvents: 8,
    totalRewards: "2,450,000",
    weeklyGrowth: 12.5,
  };

  const mockLeaderboard: LeaderboardMember[] = [
    { id: "1", rank: 1, address: "0x1234...5678", username: "CryptoWhale", reputation: 98500, contributions: 1250, badges: ["early_adopter", "whale", "governance"], level: 45, tburnStaked: "500000", joinedDate: 1672531200, isOnline: true },
    { id: "2", rank: 2, address: "0x2345...6789", username: "ValidatorKing", reputation: 87200, contributions: 980, badges: ["validator", "contributor"], level: 42, tburnStaked: "350000", joinedDate: 1675209600, isOnline: true },
    { id: "3", rank: 3, address: "0x3456...7890", username: "TBURNMaster", reputation: 76800, contributions: 850, badges: ["early_adopter", "community"], level: 39, tburnStaked: "280000", joinedDate: 1677628800, isOnline: false },
    { id: "4", rank: 4, address: "0x4567...8901", username: "DeFiExpert", reputation: 65400, contributions: 720, badges: ["contributor", "governance"], level: 36, tburnStaked: "220000", joinedDate: 1680307200, isOnline: true },
    { id: "5", rank: 5, address: "0x5678...9012", username: "BlockchainDev", reputation: 54200, contributions: 650, badges: ["contributor"], level: 33, tburnStaked: "180000", joinedDate: 1682899200, isOnline: false },
    { id: "6", rank: 6, address: "0x6789...0123", username: "StakingPro", reputation: 48900, contributions: 580, badges: ["validator", "community"], level: 31, tburnStaked: "150000", joinedDate: 1685577600, isOnline: true },
    { id: "7", rank: 7, address: "0x7890...1234", username: "TokenHolder", reputation: 42500, contributions: 510, badges: ["whale"], level: 28, tburnStaked: "120000", joinedDate: 1688169600, isOnline: false },
    { id: "8", rank: 8, address: "0x8901...2345", username: "GovernanceGuru", reputation: 38700, contributions: 460, badges: ["governance", "early_adopter"], level: 26, tburnStaked: "95000", joinedDate: 1690848000, isOnline: true },
    { id: "9", rank: 9, address: "0x9012...3456", username: "CommunityBuilder", reputation: 34200, contributions: 420, badges: ["community", "contributor"], level: 24, tburnStaked: "75000", joinedDate: 1693526400, isOnline: false },
    { id: "10", rank: 10, address: "0x0123...4567", username: "TBURNEnthusiast", reputation: 31500, contributions: 380, badges: ["early_adopter"], level: 22, tburnStaked: "60000", joinedDate: 1696118400, isOnline: true },
  ];

  const mockPosts: ForumPost[] = [
    { id: "1", title: "posts.mainnetDiscussion.title", author: "CryptoWhale", category: "announcements", content: "posts.mainnetDiscussion.content", likes: 456, comments: 89, views: 2450, isPinned: true, isHot: true, createdAt: Math.floor(Date.now() / 1000) - 3600, tags: ["mainnet", "v7.0", "launch"] },
    { id: "2", title: "posts.stakingStrategies.title", author: "StakingPro", category: "trading", content: "posts.stakingStrategies.content", likes: 234, comments: 56, views: 1890, isPinned: false, isHot: true, createdAt: Math.floor(Date.now() / 1000) - 7200, tags: ["staking", "apy", "rewards"] },
    { id: "3", title: "posts.aiOrchestration.title", author: "BlockchainDev", category: "technical", content: "posts.aiOrchestration.content", likes: 189, comments: 42, views: 1567, isPinned: false, isHot: false, createdAt: Math.floor(Date.now() / 1000) - 14400, tags: ["ai", "technical", "orchestration"] },
    { id: "4", title: "posts.governanceProposal.title", author: "GovernanceGuru", category: "governance", content: "posts.governanceProposal.content", likes: 312, comments: 78, views: 2100, isPinned: true, isHot: false, createdAt: Math.floor(Date.now() / 1000) - 28800, tags: ["governance", "proposal", "treasury"] },
    { id: "5", title: "posts.newToTburn.title", author: "CommunityBuilder", category: "general", content: "posts.newToTburn.content", likes: 567, comments: 123, views: 4500, isPinned: true, isHot: false, createdAt: Math.floor(Date.now() / 1000) - 86400, tags: ["beginner", "guide", "welcome"] },
  ];

  const mockEvents: CommunityEvent[] = [
    { id: "1", title: "events.launchAma.title", description: "events.launchAma.desc", type: "ama", startDate: Math.floor(Date.now() / 1000) + 86400, endDate: Math.floor(Date.now() / 1000) + 90000, participants: 1250, maxParticipants: 2000, rewards: "10,000 TBURN", status: "upcoming", isOnline: true },
    { id: "2", title: "events.defiWorkshop.title", description: "events.defiWorkshop.desc", type: "workshop", startDate: Math.floor(Date.now() / 1000) + 172800, endDate: Math.floor(Date.now() / 1000) + 180000, participants: 450, maxParticipants: 500, status: "upcoming", isOnline: true },
    { id: "3", title: "events.hackathon.title", description: "events.hackathon.desc", type: "hackathon", startDate: Math.floor(Date.now() / 1000) + 604800, endDate: Math.floor(Date.now() / 1000) + 777600, participants: 89, rewards: "100,000 TBURN", status: "upcoming", isOnline: false, location: "Seoul, Korea" },
    { id: "4", title: "events.tokyoMeetup.title", description: "events.tokyoMeetup.desc", type: "meetup", startDate: Math.floor(Date.now() / 1000) + 259200, endDate: Math.floor(Date.now() / 1000) + 273600, participants: 78, maxParticipants: 100, status: "upcoming", isOnline: false, location: "Tokyo, Japan" },
    { id: "5", title: "events.stakingCompetition.title", description: "events.stakingCompetition.desc", type: "competition", startDate: Math.floor(Date.now() / 1000) - 86400, endDate: Math.floor(Date.now() / 1000) + 1209600, participants: 5670, rewards: "50,000 TBURN", status: "live", isOnline: true },
    { id: "6", title: "events.nftContest.title", description: "events.nftContest.desc", type: "competition", startDate: Math.floor(Date.now() / 1000) - 172800, endDate: Math.floor(Date.now() / 1000) + 604800, participants: 234, rewards: "25,000 TBURN", status: "live", isOnline: true },
  ];

  const mockAnnouncements: Announcement[] = [
    { id: "1", title: "announcements.mainnetLaunch.title", content: "announcements.mainnetLaunch.content", type: "news", createdAt: Math.floor(Date.now() / 1000) - 3600, isImportant: true },
    { id: "2", title: "announcements.stakingTiers.title", content: "announcements.stakingTiers.content", type: "feature", createdAt: Math.floor(Date.now() / 1000) - 86400, isImportant: false },
    { id: "3", title: "announcements.securityAudit.title", content: "announcements.securityAudit.content", type: "update", createdAt: Math.floor(Date.now() / 1000) - 172800, isImportant: true },
    { id: "4", title: "announcements.bridgeIntegration.title", content: "announcements.bridgeIntegration.content", type: "feature", createdAt: Math.floor(Date.now() / 1000) - 259200, isImportant: false },
  ];

  const mockActivities: ActivityItem[] = [
    { id: "1", type: "stake", user: "CryptoWhale", action: "activities.staked", amount: "50,000 TBURN", timestamp: Math.floor(Date.now() / 1000) - 120 },
    { id: "2", type: "post", user: "ValidatorKing", action: "activities.createdPost", target: "posts.validatorBestPractices", timestamp: Math.floor(Date.now() / 1000) - 300 },
    { id: "3", type: "vote", user: "GovernanceGuru", action: "activities.votedOn", target: "#42", timestamp: Math.floor(Date.now() / 1000) - 600 },
    { id: "4", type: "badge", user: "TBURNMaster", action: "activities.earnedBadge", target: "badges.diamondStaker.name", timestamp: Math.floor(Date.now() / 1000) - 900 },
    { id: "5", type: "comment", user: "DeFiExpert", action: "activities.commentedOn", target: "posts.stakingStrategies", timestamp: Math.floor(Date.now() / 1000) - 1200 },
    { id: "6", type: "reward", user: "StakingPro", action: "activities.claimedRewards", amount: "1,250 TBURN", timestamp: Math.floor(Date.now() / 1000) - 1500 },
    { id: "7", type: "proposal", user: "CommunityBuilder", action: "activities.submittedProposal", target: "#45", timestamp: Math.floor(Date.now() / 1000) - 1800 },
    { id: "8", type: "stake", user: "BlockchainDev", action: "activities.unstaked", amount: "10,000 TBURN", timestamp: Math.floor(Date.now() / 1000) - 2100 },
  ];

  const mockBadges: UserBadge[] = [
    { id: "1", name: "badges.earlyAdopter.name", description: "badges.earlyAdopter.desc", icon: "star", rarity: "legendary", earnedAt: 1672531200 },
    { id: "2", name: "badges.diamondHands.name", description: "badges.diamondHands.desc", icon: "diamond", rarity: "epic", earnedAt: 1704067200 },
    { id: "3", name: "badges.governanceParticipant.name", description: "badges.governanceParticipant.desc", icon: "vote", rarity: "rare", progress: 80 },
    { id: "4", name: "badges.communityHelper.name", description: "badges.communityHelper.desc", icon: "users", rarity: "rare", earnedAt: 1709251200 },
    { id: "5", name: "badges.whaleStatus.name", description: "badges.whaleStatus.desc", icon: "coins", rarity: "epic", progress: 65 },
    { id: "6", name: "badges.contentCreator.name", description: "badges.contentCreator.desc", icon: "book", rarity: "common", progress: 40 },
    { id: "7", name: "badges.validator.name", description: "badges.validator.desc", icon: "shield", rarity: "legendary", earnedAt: 1714521600 },
    { id: "8", name: "badges.bridgePioneer.name", description: "badges.bridgePioneer.desc", icon: "link", rarity: "rare", progress: 70 },
    { id: "9", name: "badges.defiMaster.name", description: "badges.defiMaster.desc", icon: "trending", rarity: "epic", progress: 85 },
    { id: "10", name: "badges.bugHunter.name", description: "badges.bugHunter.desc", icon: "search", rarity: "legendary" },
  ];

  const displayStats = stats || mockStats;
  const displayLeaderboard = leaderboard || mockLeaderboard;
  const displayPosts = posts || mockPosts;
  const displayEvents = events || mockEvents;
  const displayAnnouncements = announcements || mockAnnouncements;
  const displayActivities = activities || mockActivities;
  const displayBadges = badges || mockBadges;

  const filteredPosts = displayPosts.filter(post => {
    if (selectedCategory !== "all" && post.category !== selectedCategory) return false;
    if (searchQuery && !post.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'stake': return <Coins className="h-4 w-4 text-green-400" />;
      case 'post': return <MessageSquare className="h-4 w-4 text-blue-400" />;
      case 'vote': return <Vote className="h-4 w-4 text-purple-400" />;
      case 'badge': return <Award className="h-4 w-4 text-yellow-400" />;
      case 'comment': return <MessageCircle className="h-4 w-4 text-cyan-400" />;
      case 'reward': return <Gift className="h-4 w-4 text-pink-400" />;
      case 'proposal': return <Target className="h-4 w-4 text-orange-400" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="community-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-community-title">
            <Users className="h-8 w-8 text-primary" />
            {t('community.title', 'TBURN Community')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('community.subtitle', 'Connect, collaborate, and grow with the TBURN ecosystem')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            {formatNumber(displayStats.activeMembers)} {t('community.online', 'Online')}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            data-testid="button-refresh-community"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            {t('common.refresh', 'Refresh')}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card data-testid="card-total-members">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('community.totalMembers', 'Total Members')}</p>
                <p className="text-2xl font-bold">{formatNumber(displayStats.totalMembers)}</p>
                <p className="text-xs text-green-400 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +{displayStats.weeklyGrowth}% {t('community.thisWeek', 'this week')}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-total-posts">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('community.totalPosts', 'Forum Posts')}</p>
                <p className="text-2xl font-bold">{formatNumber(displayStats.totalPosts)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatNumber(displayStats.totalComments)} {t('community.comments', 'comments')}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-proposals">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('community.proposals', 'Proposals')}</p>
                <p className="text-2xl font-bold">{displayStats.totalProposals}</p>
                <p className="text-xs text-orange-400 mt-1">
                  {displayStats.activeProposals} {t('community.active', 'active')}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Vote className="h-6 w-6 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-events">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('nav.events', 'Events')}</p>
                <p className="text-2xl font-bold">{displayStats.totalEvents}</p>
                <p className="text-xs text-purple-400 mt-1">
                  {displayStats.upcomingEvents} {t('community.upcoming', 'upcoming')}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-rewards">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('community.totalRewards', 'Rewards Distributed')}</p>
                <p className="text-2xl font-bold">{displayStats.totalRewards}</p>
                <p className="text-xs text-muted-foreground mt-1">TBURN</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-5 lg:w-[600px]">
          <TabsTrigger value="overview" data-testid="tab-overview">
            <BarChart3 className="h-4 w-4 mr-1" />
            {t('community.overview', 'Overview')}
          </TabsTrigger>
          <TabsTrigger value="forum" data-testid="tab-forum">
            <MessageSquare className="h-4 w-4 mr-1" />
            {t('community.forum', 'Forum')}
          </TabsTrigger>
          <TabsTrigger value="leaderboard" data-testid="tab-leaderboard">
            <Trophy className="h-4 w-4 mr-1" />
            {t('community.leaderboard', 'Leaderboard')}
          </TabsTrigger>
          <TabsTrigger value="events" data-testid="tab-events">
            <Calendar className="h-4 w-4 mr-1" />
            {t('nav.events', 'Events')}
          </TabsTrigger>
          <TabsTrigger value="badges" data-testid="tab-badges">
            <Award className="h-4 w-4 mr-1" />
            {t('nav.badges', 'Badges')}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Announcements */}
            <Card className="lg:col-span-2" data-testid="card-announcements">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  {t('nav.announcements', 'Announcements')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {displayAnnouncements.map((announcement) => (
                      <div key={announcement.id} className="p-4 rounded-lg bg-muted/50 space-y-2" data-testid={`announcement-${announcement.id}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {announcement.isImportant && (
                              <Badge variant="destructive" className="text-xs">
                                {t('community.important', 'Important')}
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs capitalize">
                              {t(`community.announcementTypes.${announcement.type}`, announcement.type)}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(announcement.createdAt)}
                          </span>
                        </div>
                        <h4 className="font-semibold">{announcement.translationKey ? t(`community.announcements.${announcement.translationKey}.title`, announcement.title) : announcement.title}</h4>
                        <p className="text-sm text-muted-foreground">{announcement.translationKey ? t(`community.announcements.${announcement.translationKey}.content`, announcement.content) : announcement.content}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <Card data-testid="card-activity-feed">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  {t('community.activityFeed', 'Live Activity')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {displayActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors" data-testid={`activity-${activity.id}`}>
                        <div className="mt-1">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">
                            <span className="font-medium">{activity.user}</span>
                            <span className="text-muted-foreground"> {t(`community.${activity.action}`, activity.action)} </span>
                            {activity.target && <span className="text-primary">{activity.target.startsWith('posts.') || activity.target.startsWith('badgeNames.') || activity.target.startsWith('targets.') ? t(`community.${activity.target}`, activity.target) : activity.target}</span>}
                            {activity.amount && <span className="font-medium text-green-400"> {activity.amount}</span>}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatTimeAgo(activity.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats Row */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Top Contributors */}
            <Card data-testid="card-top-contributors">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Crown className="h-4 w-4 text-yellow-400" />
                  {t('community.topContributors', 'Top Contributors')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {displayLeaderboard.slice(0, 5).map((member, index) => (
                    <div key={member.id} className="flex items-center gap-2">
                      <span className="w-5 text-xs text-muted-foreground">#{index + 1}</span>
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">{member.username.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium truncate flex-1">{member.username}</span>
                      <Badge variant="outline" className="text-xs">{formatNumber(member.reputation)}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card data-testid="card-trending">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-400" />
                  {t('community.trending', 'Trending Topics')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {displayPosts.filter(p => p.isHot).slice(0, 4).map((post) => (
                    <div key={post.id} className="flex items-center gap-2">
                      <span className="text-sm truncate flex-1">{post.title.startsWith('posts.') ? t(`community.${post.title}`, post.title) : post.title}</span>
                      <Badge variant="outline" className="text-xs">{post.likes}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card data-testid="card-upcoming-events">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-400" />
                  {t('community.upcomingEvents', 'Upcoming Events')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {displayEvents.filter(e => e.status === 'upcoming').slice(0, 3).map((event) => (
                    <div key={event.id} className="space-y-1">
                      <p className="text-sm font-medium truncate">{event.translationKey ? t(`community.events.${event.translationKey}.title`, event.title) : event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.startDate * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* My Progress */}
            <Card data-testid="card-my-progress">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-400" />
                  {t('community.myProgress', 'My Progress')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>{t('community.level', 'Level')} 15</span>
                      <span>2,450 / 3,000 XP</span>
                    </div>
                    <Progress value={82} className="h-2" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('community.reputation', 'Reputation')}</span>
                    <span className="font-medium">12,450</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('community.badgesEarned', 'Badges')}</span>
                    <span className="font-medium">8/24</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Forum Tab */}
        <TabsContent value="forum" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('community.searchPosts', 'Search posts...')}
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-posts"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[150px]" data-testid="select-category">
                  <SelectValue placeholder={t('community.category', 'Category')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all', 'All')}</SelectItem>
                  <SelectItem value="general">{t('community.general', 'General')}</SelectItem>
                  <SelectItem value="technical">{t('community.technical', 'Technical')}</SelectItem>
                  <SelectItem value="governance">{t('community.governance', 'Governance')}</SelectItem>
                  <SelectItem value="trading">{t('community.trading', 'Trading')}</SelectItem>
                  <SelectItem value="support">{t('community.support', 'Support')}</SelectItem>
                  <SelectItem value="announcements">{t('nav.announcements', 'Announcements')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={newPostDialogOpen} onOpenChange={setNewPostDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-new-post">
                  <Plus className="h-4 w-4 mr-1" />
                  {t('community.newPost', 'New Post')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>{t('community.createPost', 'Create New Post')}</DialogTitle>
                  <DialogDescription>
                    {t('community.createPostDesc', 'Share your thoughts with the TBURN community. Your post will be visible to all members.')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="post-title">{t('community.postTitleLabel', 'Title')}</Label>
                    <Input 
                      id="post-title"
                      placeholder={t('community.postTitle', 'Post title')} 
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      data-testid="input-post-title" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="post-category">{t('community.category', 'Category')}</Label>
                    <Select value={postCategory} onValueChange={setPostCategory}>
                      <SelectTrigger data-testid="select-post-category">
                        <SelectValue placeholder={t('community.selectCategory', 'Select category')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">{t('community.general', 'General')}</SelectItem>
                        <SelectItem value="technical">{t('community.technical', 'Technical')}</SelectItem>
                        <SelectItem value="governance">{t('community.governance', 'Governance')}</SelectItem>
                        <SelectItem value="trading">{t('community.trading', 'Trading')}</SelectItem>
                        <SelectItem value="support">{t('community.support', 'Support')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="post-content">{t('community.content', 'Content')}</Label>
                    <Textarea 
                      id="post-content"
                      placeholder={t('community.postContent', 'Write your post content...')} 
                      className="min-h-[150px]"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      data-testid="textarea-post-content"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="post-tags">{t('community.tags', 'Tags (comma separated)')}</Label>
                    <Input 
                      id="post-tags"
                      placeholder={t('community.tagsPlaceholder', 'e.g. staking, defi, governance')} 
                      value={postTags}
                      onChange={(e) => setPostTags(e.target.value)}
                      data-testid="input-post-tags" 
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setNewPostDialogOpen(false)}>
                    {t('common.cancel', 'Cancel')}
                  </Button>
                  <Button 
                    onClick={handleSubmitPost}
                    disabled={createPostMutation.isPending}
                    data-testid="button-submit-post"
                  >
                    {createPostMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-1" />
                    )}
                    {t('community.publish', 'Publish')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="hover:border-primary/50 transition-colors" data-testid={`post-${post.id}`}>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="hidden md:flex flex-col items-center gap-2 text-center min-w-[60px]">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`h-8 w-8 p-0 ${likedPosts.has(post.id) ? 'text-green-500 bg-green-500/10' : ''}`}
                        onClick={() => likePostMutation.mutate(post.id)}
                        disabled={likePostMutation.isPending}
                        data-testid={`button-like-${post.id}`}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <span className="font-bold text-lg">{post.likes + (likedPosts.has(post.id) ? 1 : 0)}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`h-8 w-8 p-0 ${dislikedPosts.has(post.id) ? 'text-red-500 bg-red-500/10' : ''}`}
                        onClick={() => dislikePostMutation.mutate(post.id)}
                        disabled={dislikePostMutation.isPending}
                        data-testid={`button-dislike-${post.id}`}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {post.isPinned && (
                          <Badge className="bg-primary/20 text-primary">
                            <Sparkles className="h-3 w-3 mr-1" />
                            {t('community.pinned', 'Pinned')}
                          </Badge>
                        )}
                        {post.isHot && (
                          <Badge className="bg-orange-500/20 text-orange-400">
                            <Flame className="h-3 w-3 mr-1" />
                            {t('community.hot', 'Hot')}
                          </Badge>
                        )}
                        <Badge className={categoryColors[post.category]}>
                          {t(`community.categories.${post.category}`, post.category)}
                        </Badge>
                      </div>
                      <h3 
                        className="text-lg font-semibold hover:text-primary transition-colors cursor-pointer"
                        onClick={() => openPostDetail(post)}
                        data-testid={`post-title-${post.id}`}
                      >
                        {post.title.startsWith('posts.') ? t(`community.${post.title}`, post.title) : post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{post.content.startsWith('posts.') ? t(`community.${post.content}`, post.content) : post.content}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-xs">{post.author.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(post.createdAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {post.comments} {t('community.comments', 'comments')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {formatNumber(post.views)} {t('community.views', 'views')}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs cursor-pointer hover:bg-primary/10">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          <Card data-testid="card-leaderboard">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
                {t('community.communityLeaderboard', 'Community Leaderboard')}
              </CardTitle>
              <CardDescription>
                {t('community.leaderboardDesc', 'Top contributors ranked by reputation and engagement')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {displayLeaderboard.map((member, index) => (
                  <div 
                    key={member.id} 
                    className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                      index < 3 ? 'bg-gradient-to-r from-yellow-500/10 to-transparent' : 'bg-muted/30 hover:bg-muted/50'
                    }`}
                    data-testid={`leaderboard-member-${member.id}`}
                  >
                    <div className="flex items-center justify-center w-10">
                      {index === 0 && <Crown className="h-6 w-6 text-yellow-400" />}
                      {index === 1 && <Crown className="h-5 w-5 text-gray-400" />}
                      {index === 2 && <Crown className="h-5 w-5 text-amber-600" />}
                      {index > 2 && <span className="text-lg font-bold text-muted-foreground">#{member.rank}</span>}
                    </div>
                    <Avatar className="h-12 w-12 border-2 border-primary/30">
                      <AvatarFallback className="bg-primary/10">{member.username.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{member.username}</span>
                        {member.isOnline && (
                          <span className="w-2 h-2 bg-green-500 rounded-full" />
                        )}
                        <Badge variant="outline" className="text-xs">Lv.{member.level}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{member.address}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {member.badges.map((badge) => (
                          <span key={badge} className="inline-flex">
                            {badgeIcons[badge]}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right hidden md:block">
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span className="font-bold">{formatNumber(member.reputation)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{formatNumber(member.contributions)} {t('community.contributions', 'contributions')}</p>
                    </div>
                    <div className="text-right hidden lg:block">
                      <p className="text-sm font-medium">{formatNumber(parseInt(member.tburnStaked))} TBURN</p>
                      <p className="text-xs text-muted-foreground">{t('community.staked', 'staked')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {displayEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden" data-testid={`event-${event.id}`}>
                <div className={`h-2 ${event.status === 'live' ? 'bg-green-500 animate-pulse' : event.status === 'upcoming' ? 'bg-blue-500' : 'bg-gray-500'}`} />
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Badge className={eventTypeColors[event.type]}>
                      {t(`community.eventTypes.${event.type}`, event.type.toUpperCase())}
                    </Badge>
                    <Badge variant={event.status === 'live' ? 'default' : 'outline'} className={event.status === 'live' ? 'bg-green-500' : ''}>
                      {event.status === 'live' && <span className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />}
                      {event.status === 'live' ? t('community.live', 'LIVE') : event.status === 'upcoming' ? t('community.upcoming', 'Upcoming') : t('community.ended', 'Ended')}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{event.translationKey ? t(`community.events.${event.translationKey}.title`, event.title) : event.title}</CardTitle>
                  <CardDescription>{event.translationKey ? t(`community.events.${event.translationKey}.desc`, event.description) : event.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(event.startDate * 1000).toLocaleDateString()} - {new Date(event.endDate * 1000).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {event.isOnline ? (
                      <>
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span>{t('community.onlineEvent', 'Online Event')}</span>
                      </>
                    ) : (
                      <>
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span>{event.location}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{formatNumber(event.participants)} {t('community.participants', 'participants')}</span>
                    {event.maxParticipants && (
                      <span className="text-muted-foreground">/ {formatNumber(event.maxParticipants)}</span>
                    )}
                  </div>
                  {event.rewards && (
                    <div className="flex items-center gap-2 text-sm">
                      <Gift className="h-4 w-4 text-yellow-400" />
                      <span className="text-yellow-400 font-medium">{event.rewards}</span>
                    </div>
                  )}
                  {event.maxParticipants && (
                    <Progress value={(event.participants / event.maxParticipants) * 100} className="h-2" />
                  )}
                </CardContent>
                <CardFooter>
                  {event.status === 'live' ? (
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700" 
                      onClick={() => joinEventMutation.mutate(event.id)}
                      disabled={joinEventMutation.isPending}
                      data-testid={`button-join-event-${event.id}`}
                    >
                      {joinEventMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4 mr-1" />
                      )}
                      {t('community.joinNow', 'Join Now')}
                    </Button>
                  ) : event.status === 'upcoming' ? (
                    registeredEvents.has(event.id) ? (
                      <Button 
                        className="w-full" 
                        variant="outline"
                        disabled
                        data-testid={`button-registered-event-${event.id}`}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                        {t('community.registered', 'Registered')}
                      </Button>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={() => openEventRegistration(event)}
                        data-testid={`button-register-event-${event.id}`}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {t('community.register', 'Register')}
                      </Button>
                    )
                  ) : (
                    <Button 
                      className="w-full" 
                      variant="outline" 
                      disabled
                      data-testid={`button-ended-event-${event.id}`}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      {t('community.ended', 'Ended')}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {displayBadges.map((badge) => (
              <Card key={badge.id} className={`border-2 ${rarityColors[badge.rarity]}`} data-testid={`badge-${badge.id}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={`h-16 w-16 rounded-full flex items-center justify-center ${rarityColors[badge.rarity]}`}>
                      <Award className={`h-8 w-8 ${
                        badge.rarity === 'legendary' ? 'text-yellow-400' :
                        badge.rarity === 'epic' ? 'text-purple-400' :
                        badge.rarity === 'rare' ? 'text-blue-400' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{badge.translationKey ? t(`community.badges.${badge.translationKey}.name`, badge.name) : badge.name}</h4>
                        <Badge variant="outline" className="text-xs capitalize">{t(`community.rarities.${badge.rarity}`, badge.rarity)}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{badge.translationKey ? t(`community.badges.${badge.translationKey}.description`, badge.description) : badge.description}</p>
                      {badge.earnedAt ? (
                        <div className="flex items-center gap-1 mt-2 text-xs text-green-400">
                          <CheckCircle className="h-3 w-3" />
                          {t('community.earnedOn', 'Earned')} {new Date(badge.earnedAt * 1000).toLocaleDateString()}
                        </div>
                      ) : badge.progress !== undefined ? (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>{t('community.progress', 'Progress')}</span>
                            <span>{badge.progress}%</span>
                          </div>
                          <Progress value={badge.progress} className="h-2" />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Event Registration Dialog */}
      <Dialog open={eventRegisterDialogOpen} onOpenChange={setEventRegisterDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              {t('community.registerForEvent', 'Register for Event')}
            </DialogTitle>
            <DialogDescription>
              {selectedEvent?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedEvent && (
              <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className={eventTypeColors[selectedEvent.type]}>
                    {selectedEvent.type.toUpperCase()}
                  </Badge>
                  {selectedEvent.rewards && (
                    <Badge variant="outline" className="text-yellow-400 border-yellow-400/30">
                      <Gift className="h-3 w-3 mr-1" />
                      {selectedEvent.rewards}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(selectedEvent.startDate * 1000).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {formatNumber(selectedEvent.participants)} {t('community.registered', 'registered')}
                  </span>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="reg-name">{t('community.yourName', 'Your Name')} ({t('common.optional', 'Optional')})</Label>
              <Input 
                id="reg-name"
                placeholder={t('community.enterYourName', 'Enter your name')}
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                data-testid="input-reg-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-email">{t('community.emailAddress', 'Email Address')} *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="reg-email"
                  type="email"
                  placeholder={t('community.enterEmail', 'Enter your email')}
                  className="pl-10"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  data-testid="input-reg-email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-wallet">{t('community.walletAddressOptional', 'Wallet Address (Optional)')}</Label>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="reg-wallet"
                  placeholder="0x..."
                  className="pl-10"
                  value={regWallet}
                  onChange={(e) => setRegWallet(e.target.value)}
                  data-testid="input-reg-wallet"
                />
              </div>
              <p className="text-xs text-muted-foreground">{t('community.rewards', 'Required for receiving rewards')}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setEventRegisterDialogOpen(false);
              setSelectedEvent(null);
            }}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button 
              onClick={handleEventRegister}
              disabled={registerEventMutation.isPending || !regEmail.trim()}
              data-testid="button-confirm-register"
            >
              {registerEventMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-1" />
              )}
              {t('community.confirmRegistration', 'Confirm Registration')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Post Detail Dialog */}
      <Dialog open={postDetailOpen} onOpenChange={setPostDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedPost?.title.startsWith('posts.') 
                ? t(`community.${selectedPost.title}`, selectedPost?.title) 
                : selectedPost?.title}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-xs">{selectedPost?.author.substring(0, 2)}</AvatarFallback>
                </Avatar>
                {selectedPost?.author}
              </span>
              {selectedPost && (
                <>
                  <span>{formatTimeAgo(selectedPost.createdAt)}</span>
                  <Badge className={categoryColors[selectedPost.category]}>
                    {t(`community.categories.${selectedPost.category}`, selectedPost.category)}
                  </Badge>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6">
              {/* Post content */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="whitespace-pre-wrap">
                  {selectedPost?.content.startsWith('posts.') 
                    ? t(`community.${selectedPost.content}`, selectedPost?.content) 
                    : selectedPost?.content}
                </p>
                {selectedPost?.tags && (
                  <div className="flex flex-wrap gap-1 mt-4">
                    {selectedPost.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Post stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  {selectedPost?.likes || 0} {t('community.likes', 'likes')}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  {comments.length} {t('community.comments', 'comments')}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {formatNumber(selectedPost?.views || 0)} {t('community.views', 'views')}
                </span>
              </div>

              <Separator />

              {/* Comments section */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  {t('community.commentsSection', 'Comments')} ({comments.length})
                </h4>

                {/* New comment input */}
                <div className="flex gap-2">
                  <Textarea
                    placeholder={t('community.writeComment', 'Write a comment...')}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 min-h-[80px]"
                    data-testid="textarea-new-comment"
                  />
                  <Button 
                    onClick={handleSubmitComment}
                    disabled={createCommentMutation.isPending || !newComment.trim()}
                    size="sm"
                    className="self-end"
                    data-testid="button-submit-comment"
                  >
                    {createCommentMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Comments list */}
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      {t('community.noComments', 'No comments yet. Be the first to comment!')}
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="space-y-3" data-testid={`comment-${comment.id}`}>
                        <div className="bg-muted/20 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">{comment.author.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="font-medium text-sm">{comment.author}</span>
                                <span className="text-xs text-muted-foreground ml-2">
                                  {formatTimeAgo(comment.createdAt)}
                                </span>
                                {comment.isEdited && (
                                  <span className="text-xs text-muted-foreground ml-1">(edited)</span>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2"
                              onClick={() => likeCommentMutation.mutate(comment.id)}
                              data-testid={`button-like-comment-${comment.id}`}
                            >
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              {comment.likes}
                            </Button>
                          </div>
                          <p className="mt-2 text-sm whitespace-pre-wrap">{comment.content}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 mt-2 text-xs"
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                            data-testid={`button-reply-${comment.id}`}
                          >
                            <MessageCircle className="h-3 w-3 mr-1" />
                            {t('community.reply', 'Reply')}
                          </Button>

                          {/* Reply input */}
                          {replyingTo === comment.id && (
                            <div className="flex gap-2 mt-3 pl-4 border-l-2 border-primary/30">
                              <Textarea
                                placeholder={t('community.writeReply', 'Write a reply...')}
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                className="flex-1 min-h-[60px] text-sm"
                                data-testid={`textarea-reply-${comment.id}`}
                              />
                              <div className="flex flex-col gap-1">
                                <Button 
                                  onClick={() => handleSubmitReply(comment.id)}
                                  disabled={createCommentMutation.isPending || !replyContent.trim()}
                                  size="sm"
                                  data-testid={`button-submit-reply-${comment.id}`}
                                >
                                  <Send className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setReplyingTo(null);
                                    setReplyContent("");
                                  }}
                                >
                                  <XCircle className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Nested replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="ml-8 space-y-2">
                            {comment.replies.map((reply) => (
                              <div 
                                key={reply.id} 
                                className="bg-muted/10 rounded-lg p-3 border-l-2 border-primary/30"
                                data-testid={`reply-${reply.id}`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarFallback className="text-xs">{reply.author.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <span className="font-medium text-sm">{reply.author}</span>
                                      <span className="text-xs text-muted-foreground ml-2">
                                        {formatTimeAgo(reply.createdAt)}
                                      </span>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2"
                                    onClick={() => likeCommentMutation.mutate(reply.id)}
                                    data-testid={`button-like-reply-${reply.id}`}
                                  >
                                    <ThumbsUp className="h-3 w-3 mr-1" />
                                    {reply.likes}
                                  </Button>
                                </div>
                                <p className="mt-2 text-sm whitespace-pre-wrap">{reply.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setPostDetailOpen(false)}>
              {t('common.close', 'Close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
