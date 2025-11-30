import { Router, Request, Response } from "express";
import { storage } from "../storage";
import type { 
  CommunityStats, 
  CommunityLeaderboardMember,
  CommunityPost,
  CommunityEvent,
  CommunityAnnouncement,
  CommunityActivityType,
  CommunityBadge
} from "@shared/schema";

const router = Router();

// In-memory state for community features
const eventRegistrations = new Map<string, Set<string>>();
const postLikes = new Map<string, Set<string>>();
const postDislikes = new Map<string, Set<string>>();
const userPosts: ForumPostResponse[] = [];
const activityLog: ActivityResponse[] = [];

// Initialize event registrations with base participants
const initEventRegistrations = () => {
  const baseEvents = ["1", "2", "3", "4", "5", "6", "7", "8"];
  baseEvents.forEach(eventId => {
    if (!eventRegistrations.has(eventId)) {
      eventRegistrations.set(eventId, new Set());
    }
  });
};
initEventRegistrations();

// Helper to add activity log entry
const addActivityLog = (entry: Omit<ActivityResponse, 'id' | 'timestamp'>) => {
  const activity: ActivityResponse = {
    ...entry,
    id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Math.floor(Date.now() / 1000),
  };
  activityLog.unshift(activity);
  if (activityLog.length > 100) {
    activityLog.pop();
  }
  return activity;
};

interface ForumPostResponse {
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

interface UserBadgeResponse {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt?: number;
  progress?: number;
  translationKey?: string;
}

interface ActivityResponse {
  id: string;
  type: 'post' | 'comment' | 'stake' | 'vote' | 'proposal' | 'badge' | 'reward';
  user: string;
  userAvatar?: string;
  action: string;
  target?: string;
  amount?: string;
  timestamp: number;
}

interface EventResponse {
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

interface AnnouncementResponse {
  id: string;
  title: string;
  content: string;
  type: 'update' | 'news' | 'alert' | 'feature';
  createdAt: number;
  isImportant: boolean;
  translationKey?: string;
}

router.get("/stats", async (req: Request, res: Response) => {
  try {
    const memberStats = await storage.getMemberStatistics();
    const proposals = await storage.getProposals?.() || [];
    const activeProposals = proposals.filter((p: any) => p.status === 'active' || p.status === 'voting').length;
    
    const stats: CommunityStats = {
      totalMembers: memberStats?.totalMembers || 126,
      activeMembers: memberStats?.activeMembers || 89,
      totalPosts: 89456,
      totalComments: 456789,
      totalProposals: proposals.length || 234,
      activeProposals: activeProposals || 12,
      totalEvents: 156,
      upcomingEvents: 8,
      totalRewards: "2,450,000",
      weeklyGrowth: 12.5,
    };
    
    res.json(stats);
  } catch (error) {
    console.error("[Community] Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch community stats" });
  }
});

router.get("/leaderboard", async (req: Request, res: Response) => {
  try {
    const members = await storage.getAllMembers(100);
    const stakingPositions = await storage.getAllStakingPositions(1000);
    
    const stakingByAddress = new Map<string, number>();
    stakingPositions.forEach((pos: any) => {
      const current = stakingByAddress.get(pos.delegatorAddress) || 0;
      stakingByAddress.set(pos.delegatorAddress, current + parseFloat(pos.stakedAmount || "0"));
    });
    
    const leaderboard: CommunityLeaderboardMember[] = members
      .filter((m: any) => m.kycStatus === "verified")
      .slice(0, 20)
      .map((member: any, index: number) => {
        const staked = stakingByAddress.get(member.walletAddress) || Math.floor(Math.random() * 500000);
        const reputation = Math.floor((staked / 1000) + (member.reputationScore || 0) * 100);
        
        const badgeTypes = [];
        if (index < 3) badgeTypes.push("whale", "early_adopter");
        if (member.memberTier?.includes("validator")) badgeTypes.push("validator");
        if (member.governanceParticipation > 50) badgeTypes.push("governance");
        if (reputation > 50000) badgeTypes.push("contributor");
        if (badgeTypes.length === 0) badgeTypes.push("community");
        
        return {
          id: member.id.toString(),
          rank: index + 1,
          address: `${member.walletAddress.slice(0, 6)}...${member.walletAddress.slice(-4)}`,
          username: member.displayName || `User${member.id}`,
          avatar: member.avatarUrl,
          reputation,
          contributions: Math.floor(Math.random() * 1000) + 100,
          badges: badgeTypes,
          level: Math.min(50, Math.floor(reputation / 2000) + 1),
          tburnStaked: staked.toString(),
          joinedDate: Math.floor(new Date(member.createdAt).getTime() / 1000),
          isOnline: Math.random() > 0.5,
        };
      })
      .sort((a: CommunityLeaderboardMember, b: CommunityLeaderboardMember) => b.reputation - a.reputation);
    
    leaderboard.forEach((member, index) => {
      member.rank = index + 1;
    });
    
    res.json(leaderboard);
  } catch (error) {
    console.error("[Community] Error fetching leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

router.get("/posts", async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string || "all";
    const now = Math.floor(Date.now() / 1000);
    
    const categories = ["general", "technical", "governance", "trading", "support", "announcements"];
    const samplePosts: ForumPostResponse[] = [
      { id: "1", title: "TBURN v7.0 Mainnet Launch Discussion", author: "CryptoWhale", category: "announcements", content: "Exciting times ahead! Let's discuss the upcoming mainnet launch and share your thoughts on the new features.", likes: 456, comments: 89, views: 2450, isPinned: true, isHot: true, createdAt: now - 3600, tags: ["mainnet", "v7.0", "launch"] },
      { id: "2", title: "Best Staking Strategies for Maximum APY", author: "StakingPro", category: "trading", content: "Here are my top strategies for maximizing your staking rewards. I've been testing different approaches...", likes: 234, comments: 56, views: 1890, isPinned: false, isHot: true, createdAt: now - 7200, tags: ["staking", "apy", "rewards"] },
      { id: "3", title: "Technical Deep Dive: AI Orchestration System", author: "BlockchainDev", category: "technical", content: "Let's explore how the Triple-Band AI system works under the hood. The architecture consists of...", likes: 189, comments: 42, views: 1567, isPinned: false, isHot: false, createdAt: now - 14400, tags: ["ai", "technical", "orchestration"] },
      { id: "4", title: "Governance Proposal #42: Treasury Allocation", author: "GovernanceGuru", category: "governance", content: "Proposal to allocate 5% of treasury for ecosystem development. This includes funding for...", likes: 312, comments: 78, views: 2100, isPinned: true, isHot: false, createdAt: now - 28800, tags: ["governance", "proposal", "treasury"] },
      { id: "5", title: "New to TBURN? Start Here!", author: "CommunityBuilder", category: "general", content: "Welcome to the TBURN community! This comprehensive guide will help you get started with...", likes: 567, comments: 123, views: 4500, isPinned: true, isHot: false, createdAt: now - 86400, tags: ["beginner", "guide", "welcome"] },
      { id: "6", title: "Cross-Chain Bridge Security Analysis", author: "SecurityExpert", category: "technical", content: "An in-depth analysis of the bridge security mechanisms and their implications for users.", likes: 145, comments: 34, views: 980, isPinned: false, isHot: false, createdAt: now - 43200, tags: ["bridge", "security", "analysis"] },
      { id: "7", title: "Weekly Trading Discussion Thread", author: "TraderJoe", category: "trading", content: "Let's discuss this week's market movements and trading opportunities.", likes: 89, comments: 156, views: 2340, isPinned: false, isHot: true, createdAt: now - 21600, tags: ["trading", "weekly", "discussion"] },
      { id: "8", title: "Node Setup Guide for Beginners", author: "TechSupport", category: "support", content: "Step-by-step guide on setting up your TBURN node with troubleshooting tips.", likes: 234, comments: 45, views: 1560, isPinned: false, isHot: false, createdAt: now - 172800, tags: ["node", "guide", "setup"] },
    ];
    
    const samplePostsWithDynamicCounts = samplePosts.map(post => {
      const likeCount = postLikes.get(post.id)?.size || 0;
      const dislikeCount = postDislikes.get(post.id)?.size || 0;
      return {
        ...post,
        likes: post.likes + likeCount,
        dislikes: dislikeCount,
      };
    });
    
    const userPostsWithDynamicCounts = userPosts.map(post => {
      const likeCount = postLikes.get(post.id)?.size || 0;
      const dislikeCount = postDislikes.get(post.id)?.size || 0;
      return {
        ...post,
        likes: likeCount,
        dislikes: dislikeCount,
      };
    });
    
    const allPosts = [...userPostsWithDynamicCounts, ...samplePostsWithDynamicCounts];
    
    const filteredPosts = category === "all" 
      ? allPosts 
      : allPosts.filter(p => p.category === category);
    
    filteredPosts.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.createdAt - a.createdAt;
    });
    
    res.json(filteredPosts);
  } catch (error) {
    console.error("[Community] Error fetching posts:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

router.get("/events", async (req: Request, res: Response) => {
  try {
    const now = Math.floor(Date.now() / 1000);
    
    const baseEvents: EventResponse[] = [
      { id: "1", title: "TBURN v7.0 Launch AMA", description: "Join the core team for a live Q&A session about the mainnet launch and upcoming features", type: "ama", startDate: now + 86400, endDate: now + 90000, participants: 1250, maxParticipants: 2000, rewards: "10,000 TBURN", status: "upcoming", isOnline: true, translationKey: "launchAma" },
      { id: "2", title: "DeFi Workshop: Liquidity Mining", description: "Learn advanced liquidity mining strategies with hands-on exercises and expert guidance", type: "workshop", startDate: now + 172800, endDate: now + 180000, participants: 450, maxParticipants: 500, status: "upcoming", isOnline: true, translationKey: "defiWorkshop" },
      { id: "3", title: "TBURN Hackathon 2025", description: "48-hour hackathon to build innovative dApps on TBURN. Join developers worldwide!", type: "hackathon", startDate: now + 604800, endDate: now + 777600, participants: 89, rewards: "100,000 TBURN", status: "upcoming", isOnline: false, location: "Seoul, Korea", translationKey: "hackathon" },
      { id: "4", title: "Community Meetup - Tokyo", description: "Network with fellow TBURN enthusiasts in Tokyo. Food and drinks provided!", type: "meetup", startDate: now + 259200, endDate: now + 273600, participants: 78, maxParticipants: 100, status: "upcoming", isOnline: false, location: "Tokyo, Japan", translationKey: "tokyoMeetup" },
      { id: "5", title: "Staking Competition", description: "Compete for the highest staking rewards this month. Top stakers win bonus rewards!", type: "competition", startDate: now - 86400, endDate: now + 1209600, participants: 5670, rewards: "50,000 TBURN", status: "live", isOnline: true, translationKey: "stakingCompetition" },
      { id: "6", title: "NFT Art Contest", description: "Create TBURN-themed NFT artwork and win prizes. Submissions open now!", type: "competition", startDate: now - 172800, endDate: now + 604800, participants: 234, rewards: "25,000 TBURN", status: "live", isOnline: true, translationKey: "nftContest" },
      { id: "7", title: "Validator Training Session", description: "Learn how to become a TBURN validator with this comprehensive training session", type: "workshop", startDate: now + 432000, endDate: now + 439200, participants: 156, maxParticipants: 200, status: "upcoming", isOnline: true, translationKey: "validatorTraining" },
      { id: "8", title: "Community Airdrop Event", description: "Exclusive airdrop for active community members. Complete tasks to earn rewards!", type: "airdrop", startDate: now + 518400, endDate: now + 604800, participants: 3450, rewards: "200,000 TBURN", status: "upcoming", isOnline: true, translationKey: "airdropEvent" },
    ];
    
    const eventsWithDynamicCounts = baseEvents.map(event => {
      const registeredCount = eventRegistrations.get(event.id)?.size || 0;
      return {
        ...event,
        participants: event.participants + registeredCount,
      };
    });
    
    res.json(eventsWithDynamicCounts);
  } catch (error) {
    console.error("[Community] Error fetching events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

router.get("/announcements", async (req: Request, res: Response) => {
  try {
    const now = Math.floor(Date.now() / 1000);
    
    const announcements: AnnouncementResponse[] = [
      { id: "1", title: "Mainnet Launch Date Confirmed: December 1st", content: "We're excited to announce that TBURN v7.0 Mainnet will officially launch on December 1st, 2025. All systems are go for the biggest upgrade in our history!", type: "news", createdAt: now - 3600, isImportant: true, translationKey: "mainnetLaunch" },
      { id: "2", title: "New Staking Tiers Available", content: "Diamond tier staking is now available with up to 25% APY boost. Check out the new staking dashboard for more details.", type: "feature", createdAt: now - 86400, isImportant: false, translationKey: "stakingTiers" },
      { id: "3", title: "Security Audit Completed", content: "Our smart contracts have passed comprehensive security audits by CertiK and Trail of Bits. Full reports available on GitHub.", type: "update", createdAt: now - 172800, isImportant: true, translationKey: "securityAudit" },
      { id: "4", title: "Bridge Integration: Ethereum & BSC Live", content: "Cross-chain bridge is now live for Ethereum and Binance Smart Chain. Transfer your assets seamlessly!", type: "feature", createdAt: now - 259200, isImportant: false, translationKey: "bridgeIntegration" },
      { id: "5", title: "Scheduled Maintenance: Node Upgrade", content: "Brief maintenance window scheduled for December 3rd, 2:00 AM UTC. Expected downtime: 15 minutes.", type: "alert", createdAt: now - 14400, isImportant: true, translationKey: "maintenance" },
    ];
    
    res.json(announcements);
  } catch (error) {
    console.error("[Community] Error fetching announcements:", error);
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
});

router.get("/activity", async (req: Request, res: Response) => {
  try {
    const now = Math.floor(Date.now() / 1000);
    const activities: ActivityResponse[] = [];
    
    const stakingPositions = await storage.getAllStakingPositions(10);
    stakingPositions.slice(0, 5).forEach((pos: any, index: number) => {
      activities.push({
        id: `stake-${pos.id || index}`,
        type: "stake",
        user: pos.stakerAddress ? `${pos.stakerAddress.slice(0, 6)}...${pos.stakerAddress.slice(-4)}` : "Anonymous",
        action: "activities.staked",
        amount: `${parseFloat(pos.stakedAmount || "0").toLocaleString()} TBURN`,
        timestamp: pos.createdAt ? Math.floor(new Date(pos.createdAt).getTime() / 1000) : now - (index * 300),
      });
    });
    
    const additionalActivities: ActivityResponse[] = [
      { id: "post-1", type: "post", user: "ValidatorKing", action: "activities.createdPost", target: "targets.validatorBestPractices", timestamp: now - 300 },
      { id: "vote-1", type: "vote", user: "GovernanceGuru", action: "activities.votedOn", target: "#42", timestamp: now - 600 },
      { id: "badge-1", type: "badge", user: "TBURNMaster", action: "activities.earnedBadge", target: "badgeNames.diamondStaker", timestamp: now - 900 },
      { id: "comment-1", type: "comment", user: "DeFiExpert", action: "activities.commentedOn", target: "targets.stakingStrategies", timestamp: now - 1200 },
      { id: "proposal-1", type: "proposal", user: "CommunityBuilder", action: "activities.submittedProposal", target: "#45", timestamp: now - 1800 },
      { id: "stake-live-1", type: "stake", user: "CryptoWhale", action: "activities.staked", amount: "50,000 TBURN", timestamp: now - 120 },
      { id: "reward-live-1", type: "reward", user: "StakingPro", action: "activities.claimedRewards", amount: "1,250 TBURN", timestamp: now - 1500 },
    ];
    
    const allActivities = [...activities, ...additionalActivities]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20);
    
    res.json(allActivities);
  } catch (error) {
    console.error("[Community] Error fetching activity:", error);
    res.status(500).json({ error: "Failed to fetch activity" });
  }
});

router.get("/badges", async (req: Request, res: Response) => {
  try {
    const now = Math.floor(Date.now() / 1000);
    
    const badges: UserBadgeResponse[] = [
      { id: "1", name: "Early Adopter", description: "Joined during the genesis period", icon: "star", rarity: "legendary", earnedAt: 1672531200, translationKey: "earlyAdopter" },
      { id: "2", name: "Diamond Hands", description: "Held TBURN for over 1 year", icon: "diamond", rarity: "epic", earnedAt: 1704067200, translationKey: "diamondHands" },
      { id: "3", name: "Governance Participant", description: "Voted on 10+ proposals", icon: "vote", rarity: "rare", progress: 80, translationKey: "governanceParticipant" },
      { id: "4", name: "Community Helper", description: "Helped 100+ community members", icon: "users", rarity: "rare", earnedAt: 1709251200, translationKey: "communityHelper" },
      { id: "5", name: "Whale Status", description: "Staked 100,000+ TBURN", icon: "coins", rarity: "epic", progress: 65, translationKey: "whaleStatus" },
      { id: "6", name: "Content Creator", description: "Created 50+ forum posts", icon: "book", rarity: "common", progress: 40, translationKey: "contentCreator" },
      { id: "7", name: "Validator", description: "Run an active validator node", icon: "shield", rarity: "legendary", earnedAt: 1714521600, translationKey: "validator" },
      { id: "8", name: "Bridge Pioneer", description: "Used cross-chain bridge 10+ times", icon: "bridge", rarity: "rare", progress: 70, translationKey: "bridgePioneer" },
      { id: "9", name: "DeFi Master", description: "Participated in all DeFi protocols", icon: "trending", rarity: "epic", progress: 85, translationKey: "defiMaster" },
      { id: "10", name: "Bug Hunter", description: "Reported valid security issues", icon: "bug", rarity: "legendary", translationKey: "bugHunter" },
    ];
    
    res.json(badges);
  } catch (error) {
    console.error("[Community] Error fetching badges:", error);
    res.status(500).json({ error: "Failed to fetch badges" });
  }
});

router.post("/posts", async (req: Request, res: Response) => {
  try {
    const { title, content, category, tags, author } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }
    
    const postId = `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const authorName = author || "Anonymous";
    
    const newPost: ForumPostResponse = {
      id: postId,
      title,
      content,
      author: authorName,
      category: category || "general",
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(",").map((t: string) => t.trim()) : []),
      likes: 0,
      comments: 0,
      views: 1,
      isPinned: false,
      isHot: false,
      createdAt: Math.floor(Date.now() / 1000),
    };
    
    userPosts.unshift(newPost);
    postLikes.set(postId, new Set());
    postDislikes.set(postId, new Set());
    
    addActivityLog({
      type: "post",
      user: authorName,
      action: "activities.createdPost",
      target: title,
    });
    
    console.log(`[Community] New post created: ${postId} - ${title}`);
    res.status(201).json({ success: true, post: newPost });
  } catch (error) {
    console.error("[Community] Error creating post:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
});

router.post("/posts/:postId/like", async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.body.userId || `user-${Date.now()}`;
    
    if (!postLikes.has(postId)) {
      postLikes.set(postId, new Set());
    }
    if (!postDislikes.has(postId)) {
      postDislikes.set(postId, new Set());
    }
    
    const likes = postLikes.get(postId)!;
    const dislikes = postDislikes.get(postId)!;
    
    const wasLiked = likes.has(userId);
    
    if (wasLiked) {
      likes.delete(userId);
    } else {
      likes.add(userId);
      dislikes.delete(userId);
    }
    
    console.log(`[Community] Post ${postId} ${wasLiked ? 'unliked' : 'liked'} by ${userId}`);
    res.json({ 
      success: true, 
      postId, 
      liked: !wasLiked,
      likeCount: likes.size,
      dislikeCount: dislikes.size 
    });
  } catch (error) {
    console.error("[Community] Error liking post:", error);
    res.status(500).json({ error: "Failed to like post" });
  }
});

router.post("/posts/:postId/dislike", async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.body.userId || `user-${Date.now()}`;
    
    if (!postLikes.has(postId)) {
      postLikes.set(postId, new Set());
    }
    if (!postDislikes.has(postId)) {
      postDislikes.set(postId, new Set());
    }
    
    const likes = postLikes.get(postId)!;
    const dislikes = postDislikes.get(postId)!;
    
    const wasDisliked = dislikes.has(userId);
    
    if (wasDisliked) {
      dislikes.delete(userId);
    } else {
      dislikes.add(userId);
      likes.delete(userId);
    }
    
    console.log(`[Community] Post ${postId} ${wasDisliked ? 'un-disliked' : 'disliked'} by ${userId}`);
    res.json({ 
      success: true, 
      postId, 
      disliked: !wasDisliked,
      likeCount: likes.size,
      dislikeCount: dislikes.size 
    });
  } catch (error) {
    console.error("[Community] Error disliking post:", error);
    res.status(500).json({ error: "Failed to dislike post" });
  }
});

router.get("/posts/:postId", async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const post = userPosts.find(p => p.id === postId);
    
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    
    const likeCount = postLikes.get(postId)?.size || 0;
    const dislikeCount = postDislikes.get(postId)?.size || 0;
    
    res.json({ 
      ...post, 
      likes: post.likes + likeCount,
      dislikes: dislikeCount 
    });
  } catch (error) {
    console.error("[Community] Error fetching post:", error);
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

router.post("/events/:eventId/register", async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const { userId, userName, email, walletAddress } = req.body;
    const registrantId = userId || `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    if (!eventRegistrations.has(eventId)) {
      eventRegistrations.set(eventId, new Set());
    }
    
    const registrations = eventRegistrations.get(eventId)!;
    const wasRegistered = registrations.has(registrantId);
    
    if (wasRegistered) {
      return res.json({
        success: false,
        eventId,
        registered: true,
        message: "Already registered for this event",
        participantCount: registrations.size,
      });
    }
    
    registrations.add(registrantId);
    
    addActivityLog({
      type: "badge",
      user: userName || registrantId.slice(0, 10),
      action: "registered for event",
      target: `Event #${eventId}`,
    });
    
    console.log(`[Community] User ${registrantId} registered for event ${eventId}. Total: ${registrations.size}`);
    
    res.json({
      success: true,
      eventId,
      registered: true,
      registrationId: `reg-${eventId}-${registrantId}`,
      participantCount: registrations.size,
      message: "Successfully registered for the event",
    });
  } catch (error) {
    console.error("[Community] Error registering for event:", error);
    res.status(500).json({ error: "Failed to register for event" });
  }
});

router.post("/events/:eventId/unregister", async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body;
    const registrantId = userId || `user-${Date.now()}`;
    
    if (!eventRegistrations.has(eventId)) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    const registrations = eventRegistrations.get(eventId)!;
    const wasRegistered = registrations.has(registrantId);
    
    if (wasRegistered) {
      registrations.delete(registrantId);
    }
    
    console.log(`[Community] User ${registrantId} unregistered from event ${eventId}. Total: ${registrations.size}`);
    
    res.json({
      success: true,
      eventId,
      unregistered: wasRegistered,
      participantCount: registrations.size,
      message: wasRegistered ? "Successfully unregistered from the event" : "Was not registered",
    });
  } catch (error) {
    console.error("[Community] Error unregistering from event:", error);
    res.status(500).json({ error: "Failed to unregister from event" });
  }
});

router.get("/events/:eventId/status", async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.query;
    
    const registrations = eventRegistrations.get(eventId) || new Set();
    const isRegistered = userId ? registrations.has(userId as string) : false;
    
    res.json({
      eventId,
      participantCount: registrations.size,
      isRegistered,
    });
  } catch (error) {
    console.error("[Community] Error fetching event status:", error);
    res.status(500).json({ error: "Failed to fetch event status" });
  }
});

router.post("/events/:eventId/join", async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const { userName } = req.body;
    
    addActivityLog({
      type: "badge",
      user: userName || "Anonymous",
      action: "joined live event",
      target: `Event #${eventId}`,
    });
    
    console.log(`[Community] User joined live event ${eventId}`);
    res.json({ success: true, eventId, joined: true, message: "Joined the live event" });
  } catch (error) {
    console.error("[Community] Error joining event:", error);
    res.status(500).json({ error: "Failed to join event" });
  }
});

router.get("/user-posts", async (req: Request, res: Response) => {
  try {
    const postsWithCounts = userPosts.map(post => ({
      ...post,
      likes: post.likes + (postLikes.get(post.id)?.size || 0),
    }));
    res.json(postsWithCounts);
  } catch (error) {
    console.error("[Community] Error fetching user posts:", error);
    res.status(500).json({ error: "Failed to fetch user posts" });
  }
});

router.get("/activity-log", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    res.json(activityLog.slice(0, limit));
  } catch (error) {
    console.error("[Community] Error fetching activity log:", error);
    res.status(500).json({ error: "Failed to fetch activity log" });
  }
});

export function registerCommunityRoutes(app: any) {
  app.use("/api/community", router);
  console.log("[Community] Routes registered");
}

export default router;
