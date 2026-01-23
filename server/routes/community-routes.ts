import { Router, Request, Response } from "express";
import { safeErrorResponse, safe503 } from "../core/safe-error-response";
import { storage } from "../storage";
import { addressFromString } from "../utils/tburn-address";
import type { 
  CommunityStats, 
  CommunityLeaderboardMember,
  CommunityPost,
  CommunityEvent,
  CommunityAnnouncement,
  CommunityActivityType,
  CommunityBadge,
  CommunityComment,
  InsertCommunityPost,
  InsertCommunityComment,
  InsertCommunityActivity,
} from "@shared/schema";

const broadcastToAll = (type: string, data: any) => {
  console.log(`[Community WebSocket] Broadcasting ${type}:`, JSON.stringify(data).slice(0, 100));
};

const router = Router();

interface ForumPostResponse {
  id: string;
  title: string;
  titleKo?: string;
  author: string;
  authorAvatar?: string;
  category: string;
  content: string;
  contentKo?: string;
  likes: number;
  dislikes?: number;
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
  type: 'post' | 'comment' | 'stake' | 'vote' | 'proposal' | 'badge' | 'reward' | 'event';
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
  isRegistered?: boolean;
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

interface CommentResponse {
  id: string;
  postId: string;
  author: string;
  authorAvatar?: string;
  content: string;
  likes: number;
  replies?: CommentResponse[];
  createdAt: number;
  isEdited: boolean;
}

interface ForumPostResponseWithKey extends ForumPostResponse {
  translationKey?: string;
}

const getSamplePosts = (now: number): ForumPostResponseWithKey[] => [
  { id: "sample-1", title: "TBURN v7.0 Mainnet Launch Discussion", author: "CryptoWhale", category: "announcements", content: "Exciting times ahead! Let's discuss the upcoming mainnet launch and share your thoughts on the new features.", likes: 456, comments: 89, views: 2450, isPinned: true, isHot: true, createdAt: now - 3600, tags: ["mainnet", "v7.0", "launch"], translationKey: "mainnetLaunch" },
  { id: "sample-2", title: "Best Staking Strategies for Maximum APY", author: "StakingPro", category: "trading", content: "Here are my top strategies for maximizing your staking rewards. I've been testing different approaches...", likes: 234, comments: 56, views: 1890, isPinned: false, isHot: true, createdAt: now - 7200, tags: ["staking", "apy", "rewards"], translationKey: "stakingStrategies" },
  { id: "sample-3", title: "Technical Deep Dive: AI Orchestration System", author: "BlockchainDev", category: "technical", content: "Let's explore how the Triple-Band AI system works under the hood. The architecture consists of...", likes: 189, comments: 42, views: 1567, isPinned: false, isHot: false, createdAt: now - 14400, tags: ["ai", "technical", "orchestration"], translationKey: "aiOrchestration" },
  { id: "sample-4", title: "Governance Proposal #42: Treasury Allocation", author: "GovernanceGuru", category: "governance", content: "Proposal to allocate 5% of treasury for ecosystem development. This includes funding for...", likes: 312, comments: 78, views: 2100, isPinned: true, isHot: false, createdAt: now - 28800, tags: ["governance", "proposal", "treasury"], translationKey: "treasuryProposal" },
  { id: "sample-5", title: "New to TBURN? Start Here!", author: "CommunityBuilder", category: "general", content: "Welcome to the TBURN community! This comprehensive guide will help you get started with...", likes: 567, comments: 123, views: 4500, isPinned: true, isHot: false, createdAt: now - 86400, tags: ["beginner", "guide", "welcome"], translationKey: "welcomeGuide" },
  { id: "sample-6", title: "Cross-Chain Bridge Security Analysis", author: "SecurityExpert", category: "technical", content: "An in-depth analysis of the bridge security mechanisms and their implications for users.", likes: 145, comments: 34, views: 980, isPinned: false, isHot: false, createdAt: now - 43200, tags: ["bridge", "security", "analysis"], translationKey: "bridgeSecurity" },
  { id: "sample-7", title: "Weekly Trading Discussion Thread", author: "TraderJoe", category: "trading", content: "Let's discuss this week's market movements and trading opportunities.", likes: 89, comments: 156, views: 2340, isPinned: false, isHot: true, createdAt: now - 21600, tags: ["trading", "weekly", "discussion"], translationKey: "weeklyTrading" },
  { id: "sample-8", title: "Node Setup Guide for Beginners", author: "TechSupport", category: "support", content: "Step-by-step guide on setting up your TBURN node with troubleshooting tips.", likes: 234, comments: 45, views: 1560, isPinned: false, isHot: false, createdAt: now - 172800, tags: ["node", "guide", "setup"], translationKey: "nodeSetup" },
];

const getSampleEvents = (now: number): EventResponse[] => [
  { id: "event-1", title: "TBURN v7.0 Launch AMA", description: "Join the core team for a live Q&A session about the mainnet launch and upcoming features", type: "ama", startDate: now + 86400, endDate: now + 90000, participants: 1250, maxParticipants: 2000, rewards: "10,000 TBURN", status: "upcoming", isOnline: true, translationKey: "launchAma" },
  { id: "event-2", title: "DeFi Workshop: Liquidity Mining", description: "Learn advanced liquidity mining strategies with hands-on exercises and expert guidance", type: "workshop", startDate: now + 172800, endDate: now + 180000, participants: 450, maxParticipants: 500, status: "upcoming", isOnline: true, translationKey: "defiWorkshop" },
  { id: "event-3", title: "TBURN Hackathon 2025", description: "48-hour hackathon to build innovative dApps on TBURN. Join developers worldwide!", type: "hackathon", startDate: now + 604800, endDate: now + 777600, participants: 89, rewards: "100,000 TBURN", status: "upcoming", isOnline: false, location: "San Francisco, USA", translationKey: "hackathon" },
  { id: "event-4", title: "Community Meetup - Tokyo", description: "Network with fellow TBURN enthusiasts in Tokyo. Food and drinks provided!", type: "meetup", startDate: now + 259200, endDate: now + 273600, participants: 78, maxParticipants: 100, status: "upcoming", isOnline: false, location: "Tokyo, Japan", translationKey: "tokyoMeetup" },
  { id: "event-5", title: "Staking Competition", description: "Compete for the highest staking rewards this month. Top stakers win bonus rewards!", type: "competition", startDate: now - 86400, endDate: now + 1209600, participants: 5670, rewards: "50,000 TBURN", status: "live", isOnline: true, translationKey: "stakingCompetition" },
  { id: "event-6", title: "NFT Art Contest", description: "Create TBURN-themed NFT artwork and win prizes. Submissions open now!", type: "competition", startDate: now - 172800, endDate: now + 604800, participants: 234, rewards: "25,000 TBURN", status: "live", isOnline: true, translationKey: "nftContest" },
  { id: "event-7", title: "Validator Training Session", description: "Learn how to become a TBURN validator with this comprehensive training session", type: "workshop", startDate: now + 432000, endDate: now + 439200, participants: 156, maxParticipants: 200, status: "upcoming", isOnline: true, translationKey: "validatorTraining" },
  { id: "event-8", title: "Community Airdrop Event", description: "Exclusive airdrop for active community members. Complete tasks to earn rewards!", type: "airdrop", startDate: now + 518400, endDate: now + 604800, participants: 3450, rewards: "200,000 TBURN", status: "upcoming", isOnline: true, translationKey: "airdropEvent" },
];

const getSampleAnnouncements = (now: number): AnnouncementResponse[] => [
  { id: "ann-1", title: "Mainnet Launch Date Confirmed: December 8th", content: "We're excited to announce that TBURN v7.0 Mainnet will officially launch on December 8th, 2024. All systems are go for the biggest upgrade in our history!", type: "news", createdAt: now - 3600, isImportant: true, translationKey: "mainnetLaunch" },
  { id: "ann-2", title: "New Staking Tiers Available", content: "Diamond tier staking is now available with up to 25% APY boost. Check out the new staking dashboard for more details.", type: "feature", createdAt: now - 86400, isImportant: false, translationKey: "stakingTiers" },
  { id: "ann-3", title: "Security Audit Completed", content: "Our smart contracts have passed comprehensive security audits by CertiK and Trail of Bits. Full reports available on GitHub.", type: "update", createdAt: now - 172800, isImportant: true, translationKey: "securityAudit" },
  { id: "ann-4", title: "Cross-Chain Bridge Now Live", content: "The TBURN bridge is now live, supporting transfers between Ethereum, BSC, and Polygon networks.", type: "feature", createdAt: now - 259200, isImportant: false, translationKey: "bridgeIntegration" },
  { id: "ann-5", title: "Scheduled Maintenance: Node Upgrade", content: "Brief maintenance window scheduled for December 10th, 2:00 AM UTC. Expected downtime: 15 minutes.", type: "alert", createdAt: now - 14400, isImportant: true, translationKey: "maintenance" },
  { id: "ann-6", title: "AI Orchestration System Goes Live", content: "The Quad-Band AI Orchestration System is now fully operational with Gemini 3 Pro as primary, Claude Sonnet 4.5, GPT-4o, and Grok 3 as fallback.", type: "feature", createdAt: now - 7200, isImportant: true, translationKey: "aiOrchestration" },
];

const getSampleBadges = (): UserBadgeResponse[] => [
  { id: "badge-1", name: "Early Adopter", description: "Joined during the genesis period", icon: "star", rarity: "legendary", earnedAt: 1672531200, translationKey: "earlyAdopter" },
  { id: "badge-2", name: "Diamond Hands", description: "Held TBURN for over 1 year", icon: "diamond", rarity: "epic", earnedAt: 1704067200, translationKey: "diamondHands" },
  { id: "badge-3", name: "Governance Participant", description: "Voted on 10+ proposals", icon: "vote", rarity: "rare", progress: 80, translationKey: "governanceParticipant" },
  { id: "badge-4", name: "Community Helper", description: "Helped 100+ community members", icon: "users", rarity: "rare", earnedAt: 1709251200, translationKey: "communityHelper" },
  { id: "badge-5", name: "Whale Status", description: "Staked 100,000+ TBURN", icon: "coins", rarity: "epic", progress: 65, translationKey: "whaleStatus" },
  { id: "badge-6", name: "Content Creator", description: "Created 50+ forum posts", icon: "book", rarity: "common", progress: 40, translationKey: "contentCreator" },
  { id: "badge-7", name: "Validator", description: "Run an active validator node", icon: "shield", rarity: "legendary", earnedAt: 1714521600, translationKey: "validator" },
  { id: "badge-8", name: "Bridge Pioneer", description: "Used cross-chain bridge 10+ times", icon: "bridge", rarity: "rare", progress: 70, translationKey: "bridgePioneer" },
  { id: "badge-9", name: "DeFi Master", description: "Participated in all DeFi protocols", icon: "trending", rarity: "epic", progress: 85, translationKey: "defiMaster" },
  { id: "badge-10", name: "Bug Hunter", description: "Reported valid security issues", icon: "bug", rarity: "legendary", translationKey: "bugHunter" },
];

const logActivity = async (type: string, user: string, action: string, target?: string, amount?: string) => {
  try {
    await storage.createCommunityActivity({
      userId: 0,
      userAddress: "",
      username: user,
      activityType: type,
      action,
      targetId: target,
      targetTitle: target,
      amount,
    });
  } catch (error) {
    console.error("[Community] Error logging activity:", error);
  }
};

router.get("/stats", async (req: Request, res: Response) => {
  try {
    const dbStats = await storage.getCommunityStats();
    const memberStats = await storage.getMemberStatistics();
    
    const stats: CommunityStats = {
      totalMembers: memberStats?.totalMembers || dbStats.totalMembers || 126847,
      activeMembers: memberStats?.activeMembers || dbStats.activeMembers || 89234,
      totalPosts: dbStats.totalPosts || 89456,
      totalComments: dbStats.totalComments || 456789,
      totalProposals: dbStats.totalProposals || 234,
      activeProposals: dbStats.activeProposals || 12,
      totalEvents: dbStats.totalEvents || 156,
      upcomingEvents: dbStats.upcomingEvents || 8,
      totalRewards: dbStats.totalRewards || "2,450,000",
      weeklyGrowth: dbStats.weeklyGrowth || 12.5,
    };
    
    res.json(stats);
  } catch (error) {
    console.error("[Community] Error fetching stats:", error);
    res.status(503).json({ error: "Failed to fetch community stats" });
  }
});

router.get("/leaderboard", async (req: Request, res: Response) => {
  try {
    const reputations = await storage.getLeaderboard(20);
    const members = await storage.getAllMembers(100);
    const stakingPositions = await storage.getAllStakingPositions(1000);
    
    const stakingByAddress = new Map<string, number>();
    stakingPositions.forEach((pos: any) => {
      const current = stakingByAddress.get(pos.delegatorAddress) || 0;
      stakingByAddress.set(pos.delegatorAddress, current + parseFloat(pos.stakedAmount || "0"));
    });
    
    let leaderboard: CommunityLeaderboardMember[] = [];
    
    if (reputations.length > 0) {
      leaderboard = reputations.map((rep, index) => ({
        id: rep.id,
        rank: index + 1,
        address: rep.userAddress ? `${rep.userAddress.slice(0, 6)}...${rep.userAddress.slice(-4)}` : "Unknown",
        username: `User${rep.userId}`,
        reputation: rep.reputation || 0,
        contributions: rep.contributions || 0,
        badges: [],
        level: rep.level || 1,
        tburnStaked: stakingByAddress.get(rep.userAddress)?.toString() || "0",
        joinedDate: Math.floor(new Date(rep.createdAt).getTime() / 1000),
        isOnline: Math.random() > 0.5,
      }));
    } else {
      leaderboard = members
        .filter((m: any) => m.kycStatus === "verified")
        .slice(0, 20)
        .map((member: any, index: number) => {
          const staked = stakingByAddress.get(member.accountAddress) || Math.floor(Math.random() * 500000);
          const reputation = Math.floor((staked / 1000) + (member.reputationScore || 0) * 100);
          
          const badgeTypes: string[] = [];
          if (index < 3) badgeTypes.push("whale", "early_adopter");
          if (member.memberTier?.includes("validator")) badgeTypes.push("validator");
          if (member.governanceParticipation > 50) badgeTypes.push("governance");
          if (reputation > 50000) badgeTypes.push("contributor");
          if (badgeTypes.length === 0) badgeTypes.push("community");
          
          return {
            id: member.id.toString(),
            rank: index + 1,
            address: `${member.accountAddress.slice(0, 6)}...${member.accountAddress.slice(-4)}`,
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
    }
    
    leaderboard.forEach((member, index) => {
      member.rank = index + 1;
    });
    
    res.json(leaderboard);
  } catch (error) {
    console.error("[Community] Error fetching leaderboard:", error);
    res.status(503).json({ error: "Failed to fetch leaderboard" });
  }
});

const postTranslationKeyMap: Record<string, string> = {
  "sample-1": "mainnetLaunch",
  "sample-2": "stakingStrategies",
  "sample-3": "aiOrchestration",
  "sample-4": "treasuryProposal",
  "sample-5": "welcomeGuide",
  "sample-6": "bridgeSecurity",
  "sample-7": "weeklyTrading",
  "sample-8": "nodeSetup",
};

const announcementTranslationKeyMap: Record<string, string> = {
  "ann-1": "mainnetLaunch",
  "ann-2": "stakingTiers",
  "ann-3": "securityAudit",
  "ann-4": "bridgeIntegration",
  "ann-5": "maintenance",
  "ann-6": "aiOrchestration",
};

const eventTranslationKeyMap: Record<string, string> = {
  "event-1": "launchAma",
  "event-2": "defiWorkshop",
  "event-3": "hackathon",
  "event-4": "tokyoMeetup",
  "event-5": "stakingCompetition",
  "event-6": "nftContest",
  "event-7": "validatorTraining",
  "event-8": "airdropEvent",
};

router.get("/posts", async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string || "all";
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const now = Math.floor(Date.now() / 1000);
    
    const dbPosts = await storage.getAllCommunityPosts(limit, offset, category === "all" ? undefined : category);
    
    const formattedDbPosts: ForumPostResponseWithKey[] = dbPosts.map(post => ({
      id: post.id,
      title: post.title,
      titleKo: post.titleKo || undefined,
      author: post.authorUsername || `User${post.authorId}`,
      category: post.category,
      content: post.content,
      contentKo: post.contentKo || undefined,
      likes: post.likes || 0,
      dislikes: 0,
      comments: post.commentCount || 0,
      views: post.views || 0,
      isPinned: post.isPinned || false,
      isHot: post.isHot || false,
      createdAt: Math.floor(new Date(post.createdAt).getTime() / 1000),
      tags: post.tags || [],
      translationKey: postTranslationKeyMap[post.id] || undefined,
    }));
    
    // Only use sample data if database is empty
    let allPosts: ForumPostResponseWithKey[];
    if (formattedDbPosts.length === 0) {
      const samplePosts = getSamplePosts(now);
      allPosts = category === "all" 
        ? samplePosts 
        : samplePosts.filter(p => p.category === category);
    } else {
      allPosts = formattedDbPosts;
    }
    
    allPosts.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.createdAt - a.createdAt;
    });
    
    res.json(allPosts);
  } catch (error) {
    console.error("[Community] Error fetching posts:", error);
    res.status(503).json({ error: "Failed to fetch posts" });
  }
});

router.get("/posts/:postId", async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = parseInt(req.query.userId as string) || 0;
    
    const dbPost = await storage.getCommunityPostById(postId);
    
    if (dbPost) {
      await storage.incrementPostViews(postId);
      
      const reactionCounts = await storage.getPostReactionCounts(postId);
      const userReaction = userId ? await storage.getPostReactionByUser(postId, userId) : undefined;
      const comments = await storage.getCommentsByPostId(postId, 100);
      
      const formattedComments: CommentResponse[] = await Promise.all(
        comments.map(async (comment) => {
          const replies = await storage.getCommentReplies(comment.id);
          return {
            id: comment.id,
            postId: comment.postId,
            author: comment.authorUsername || `User${comment.authorId}`,
            content: comment.content,
            likes: comment.likes || 0,
            createdAt: Math.floor(new Date(comment.createdAt).getTime() / 1000),
            isEdited: comment.isEdited || false,
            replies: replies.map(r => ({
              id: r.id,
              postId: r.postId,
              author: r.authorUsername || `User${r.authorId}`,
              content: r.content,
              likes: r.likes || 0,
              createdAt: Math.floor(new Date(r.createdAt).getTime() / 1000),
              isEdited: r.isEdited || false,
            })),
          };
        })
      );
      
      res.json({
        id: dbPost.id,
        title: dbPost.title,
        author: dbPost.authorUsername || `User${dbPost.authorId}`,
        category: dbPost.category,
        content: dbPost.content,
        likes: reactionCounts.likes,
        dislikes: reactionCounts.dislikes,
        comments: dbPost.commentCount || 0,
        views: (dbPost.views || 0) + 1,
        isPinned: dbPost.isPinned,
        isHot: dbPost.isHot,
        createdAt: Math.floor(new Date(dbPost.createdAt).getTime() / 1000),
        tags: dbPost.tags || [],
        userLiked: userReaction?.reactionType === 'like',
        userDisliked: userReaction?.reactionType === 'dislike',
        commentsList: formattedComments,
      });
    } else {
      const now = Math.floor(Date.now() / 1000);
      const samplePosts = getSamplePosts(now);
      const samplePost = samplePosts.find(p => p.id === postId);
      
      if (samplePost) {
        res.json({
          ...samplePost,
          dislikes: 0,
          userLiked: false,
          userDisliked: false,
          commentsList: [],
        });
      } else {
        res.status(404).json({ error: "Post not found" });
      }
    }
  } catch (error) {
    console.error("[Community] Error fetching post:", error);
    res.status(503).json({ error: "Failed to fetch post" });
  }
});

router.post("/posts", async (req: Request, res: Response) => {
  try {
    const { title, content, category, tags, author, authorId, authorAddress } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }
    
    const postData: InsertCommunityPost = {
      authorId: authorId || 0,
      authorAddress: authorAddress || addressFromString('tburn-community-author'),
      authorUsername: author || "Anonymous",
      title,
      content,
      category: category || "general",
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(",").map((t: string) => t.trim()) : []),
      status: "active",
      isPinned: false,
      isHot: false,
      isLocked: false,
    };
    
    const newPost = await storage.createCommunityPost(postData);
    
    await logActivity("post", author || "Anonymous", "activities.createdPost", title);
    
    broadcastToAll("community_new_post", {
      postId: newPost.id,
      title: newPost.title,
      author: newPost.authorUsername,
    });
    
    console.log(`[Community] New post created: ${newPost.id} - ${title}`);
    res.status(201).json({ 
      success: true, 
      post: {
        id: newPost.id,
        title: newPost.title,
        author: newPost.authorUsername,
        category: newPost.category,
        content: newPost.content,
        likes: 0,
        comments: 0,
        views: 0,
        isPinned: false,
        isHot: false,
        createdAt: Math.floor(new Date(newPost.createdAt).getTime() / 1000),
        tags: newPost.tags || [],
      }
    });
  } catch (error) {
    console.error("[Community] Error creating post:", error);
    res.status(503).json({ error: "Failed to create post" });
  }
});

router.post("/posts/:postId/like", async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { userId, userAddress } = req.body;
    const numericUserId = parseInt(userId) || 0;
    
    const existingReaction = await storage.getPostReactionByUser(postId, numericUserId);
    
    if (existingReaction) {
      if (existingReaction.reactionType === 'like') {
        await storage.deletePostReaction(postId, numericUserId);
        await storage.decrementPostLikes(postId);
      } else {
        await storage.deletePostReaction(postId, numericUserId);
        await storage.createPostReaction({
          postId,
          userId: numericUserId,
          userAddress: userAddress || "",
          reactionType: "like",
        });
        await storage.incrementPostLikes(postId);
      }
    } else {
      await storage.createPostReaction({
        postId,
        userId: numericUserId,
        userAddress: userAddress || "",
        reactionType: "like",
      });
      await storage.incrementPostLikes(postId);
    }
    
    const counts = await storage.getPostReactionCounts(postId);
    
    broadcastToAll("community_post_reaction", {
      postId,
      likes: counts.likes,
      dislikes: counts.dislikes,
    });
    
    res.json({ 
      success: true, 
      postId, 
      liked: !existingReaction || existingReaction.reactionType !== 'like',
      likeCount: counts.likes,
      dislikeCount: counts.dislikes,
    });
  } catch (error) {
    console.error("[Community] Error liking post:", error);
    res.status(503).json({ error: "Failed to like post" });
  }
});

router.post("/posts/:postId/dislike", async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { userId, userAddress } = req.body;
    const numericUserId = parseInt(userId) || 0;
    
    const existingReaction = await storage.getPostReactionByUser(postId, numericUserId);
    
    if (existingReaction) {
      if (existingReaction.reactionType === 'dislike') {
        await storage.deletePostReaction(postId, numericUserId);
      } else {
        await storage.deletePostReaction(postId, numericUserId);
        await storage.createPostReaction({
          postId,
          userId: numericUserId,
          userAddress: userAddress || "",
          reactionType: "dislike",
        });
        await storage.decrementPostLikes(postId);
      }
    } else {
      await storage.createPostReaction({
        postId,
        userId: numericUserId,
        userAddress: userAddress || "",
        reactionType: "dislike",
      });
    }
    
    const counts = await storage.getPostReactionCounts(postId);
    
    broadcastToAll("community_post_reaction", {
      postId,
      likes: counts.likes,
      dislikes: counts.dislikes,
    });
    
    res.json({ 
      success: true, 
      postId, 
      disliked: !existingReaction || existingReaction.reactionType !== 'dislike',
      likeCount: counts.likes,
      dislikeCount: counts.dislikes,
    });
  } catch (error) {
    console.error("[Community] Error disliking post:", error);
    res.status(503).json({ error: "Failed to dislike post" });
  }
});

router.get("/posts/:postId/comments", async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;
    
    const comments = await storage.getCommentsByPostId(postId, limit);
    
    const formattedComments: CommentResponse[] = await Promise.all(
      comments.map(async (comment) => {
        const replies = await storage.getCommentReplies(comment.id);
        return {
          id: comment.id,
          postId: comment.postId,
          author: comment.authorUsername || `User${comment.authorId}`,
          content: comment.content,
          likes: comment.likes || 0,
          createdAt: Math.floor(new Date(comment.createdAt).getTime() / 1000),
          isEdited: comment.isEdited || false,
          replies: replies.map(r => ({
            id: r.id,
            postId: r.postId,
            author: r.authorUsername || `User${r.authorId}`,
            content: r.content,
            likes: r.likes || 0,
            createdAt: Math.floor(new Date(r.createdAt).getTime() / 1000),
            isEdited: r.isEdited || false,
          })),
        };
      })
    );
    
    res.json(formattedComments);
  } catch (error) {
    console.error("[Community] Error fetching comments:", error);
    res.status(503).json({ error: "Failed to fetch comments" });
  }
});

router.post("/posts/:postId/comments", async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { content, author, authorId, authorAddress, parentCommentId } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }
    
    const commentData: InsertCommunityComment = {
      postId,
      authorId: authorId || 0,
      authorAddress: authorAddress || addressFromString('tburn-community-author'),
      authorUsername: author || "Anonymous",
      content,
      parentCommentId: parentCommentId || null,
      status: "active",
    };
    
    const newComment = await storage.createCommunityComment(commentData);
    await storage.incrementPostCommentCount(postId);
    
    const post = await storage.getCommunityPostById(postId);
    await logActivity("comment", author || "Anonymous", "activities.commentedOn", post?.title);
    
    broadcastToAll("community_new_comment", {
      postId,
      commentId: newComment.id,
      author: newComment.authorUsername,
    });
    
    res.status(201).json({
      success: true,
      comment: {
        id: newComment.id,
        postId: newComment.postId,
        author: newComment.authorUsername,
        content: newComment.content,
        likes: 0,
        createdAt: Math.floor(new Date(newComment.createdAt).getTime() / 1000),
        isEdited: false,
        replies: [],
      },
    });
  } catch (error) {
    console.error("[Community] Error creating comment:", error);
    res.status(503).json({ error: "Failed to create comment" });
  }
});

router.post("/comments/:commentId/like", async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { userId, userAddress } = req.body;
    const numericUserId = parseInt(userId) || 0;
    
    const existingReaction = await storage.getCommentReactionByUser(commentId, numericUserId);
    
    if (existingReaction) {
      await storage.deleteCommentReaction(commentId, numericUserId);
      if (existingReaction.reactionType === 'like') {
        await storage.decrementCommentLikes(commentId);
      }
    } else {
      await storage.createCommentReaction({
        commentId,
        userId: numericUserId,
        userAddress: userAddress || "",
        reactionType: "like",
      });
      await storage.incrementCommentLikes(commentId);
    }
    
    const comment = await storage.getCommentById(commentId);
    
    res.json({
      success: true,
      commentId,
      liked: !existingReaction,
      likeCount: comment?.likes || 0,
    });
  } catch (error) {
    console.error("[Community] Error liking comment:", error);
    res.status(503).json({ error: "Failed to like comment" });
  }
});

router.get("/events", async (req: Request, res: Response) => {
  try {
    const now = Math.floor(Date.now() / 1000);
    const userId = parseInt(req.query.userId as string) || 0;
    
    const dbEvents = await storage.getAllCommunityEvents(50);
    
    let events: EventResponse[] = [];
    
    if (dbEvents.length > 0) {
      events = await Promise.all(dbEvents.map(async (event) => {
        const registrations = await storage.getEventRegistrationsByEvent(event.id);
        const userRegistration = userId ? await storage.getEventRegistration(event.id, userId) : undefined;
        
        return {
          id: event.id,
          title: event.title,
          titleKo: event.titleKo || event.title,
          description: event.description,
          descriptionKo: event.descriptionKo || event.description,
          type: event.eventType as any,
          startDate: Math.floor(new Date(event.startDate).getTime() / 1000),
          endDate: Math.floor(new Date(event.endDate).getTime() / 1000),
          participants: (event.participants || 0) + registrations.length,
          maxParticipants: event.maxParticipants || undefined,
          rewards: event.rewards || undefined,
          status: event.status as any,
          location: event.location || undefined,
          isOnline: event.isOnline || true,
          isRegistered: !!userRegistration,
          translationKey: eventTranslationKeyMap[event.id] || undefined,
        };
      }));
    } else {
      // Only use sample events if database is empty
      events = getSampleEvents(now);
    }
    
    res.json(events);
  } catch (error) {
    console.error("[Community] Error fetching events:", error);
    res.status(503).json({ error: "Failed to fetch events" });
  }
});

router.post("/events/:eventId/register", async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const { userId, userName, walletAddress } = req.body;
    const numericUserId = parseInt(userId) || 0;
    
    const existingRegistration = await storage.getEventRegistration(eventId, numericUserId);
    
    if (existingRegistration) {
      return res.json({
        success: false,
        eventId,
        registered: true,
        message: "Already registered for this event",
      });
    }
    
    const registration = await storage.createEventRegistration({
      eventId,
      userId: numericUserId,
      userAddress: walletAddress || "",
      username: userName,
      status: "registered",
    });
    
    await storage.incrementEventParticipants(eventId);
    await logActivity("event", userName || "Anonymous", "registered for event", `Event #${eventId}`);
    
    const registrations = await storage.getEventRegistrationsByEvent(eventId);
    
    broadcastToAll("community_event_registration", {
      eventId,
      participantCount: registrations.length,
    });
    
    res.json({
      success: true,
      eventId,
      registered: true,
      registrationId: registration.id,
      participantCount: registrations.length,
      message: "Successfully registered for the event",
    });
  } catch (error) {
    console.error("[Community] Error registering for event:", error);
    res.status(503).json({ error: "Failed to register for event" });
  }
});

router.post("/events/:eventId/unregister", async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body;
    const numericUserId = parseInt(userId) || 0;
    
    const existingRegistration = await storage.getEventRegistration(eventId, numericUserId);
    
    if (!existingRegistration) {
      return res.json({
        success: false,
        eventId,
        unregistered: false,
        message: "Not registered for this event",
      });
    }
    
    await storage.deleteEventRegistration(eventId, numericUserId);
    await storage.decrementEventParticipants(eventId);
    
    const registrations = await storage.getEventRegistrationsByEvent(eventId);
    
    broadcastToAll("community_event_registration", {
      eventId,
      participantCount: registrations.length,
    });
    
    res.json({
      success: true,
      eventId,
      unregistered: true,
      participantCount: registrations.length,
      message: "Successfully unregistered from the event",
    });
  } catch (error) {
    console.error("[Community] Error unregistering from event:", error);
    res.status(503).json({ error: "Failed to unregister from event" });
  }
});

router.get("/events/:eventId/status", async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const userId = parseInt(req.query.userId as string) || 0;
    
    const registrations = await storage.getEventRegistrationsByEvent(eventId);
    const userRegistration = userId ? await storage.getEventRegistration(eventId, userId) : undefined;
    
    res.json({
      eventId,
      participantCount: registrations.length,
      isRegistered: !!userRegistration,
    });
  } catch (error) {
    console.error("[Community] Error fetching event status:", error);
    res.status(503).json({ error: "Failed to fetch event status" });
  }
});

router.get("/announcements", async (req: Request, res: Response) => {
  try {
    const now = Math.floor(Date.now() / 1000);
    
    const dbAnnouncements = await storage.getAllCommunityAnnouncements(20);
    
    let announcements: AnnouncementResponse[] = [];
    
    if (dbAnnouncements.length > 0) {
      announcements = dbAnnouncements.map(ann => ({
        id: ann.id,
        title: ann.title,
        titleKo: ann.titleKo || ann.title,
        content: ann.content,
        contentKo: ann.contentKo || ann.content,
        type: ann.announcementType as any,
        createdAt: Math.floor(new Date(ann.createdAt).getTime() / 1000),
        isImportant: ann.isImportant || false,
        isPinned: ann.isPinned || false,
        views: ann.views || 0,
        translationKey: announcementTranslationKeyMap[ann.id] || undefined,
      }));
    } else {
      // Only use sample announcements if database is empty
      announcements = getSampleAnnouncements(now);
    }
    
    res.json(announcements);
  } catch (error) {
    console.error("[Community] Error fetching announcements:", error);
    res.status(503).json({ error: "Failed to fetch announcements" });
  }
});

router.get("/activity", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const now = Math.floor(Date.now() / 1000);
    
    const dbActivities = await storage.getRecentCommunityActivity(limit);
    
    const activities: ActivityResponse[] = dbActivities.map(act => ({
      id: act.id,
      type: act.activityType as any,
      user: act.username || `User${act.userId}`,
      action: act.action,
      target: act.targetTitle || undefined,
      amount: act.amount || undefined,
      timestamp: Math.floor(new Date(act.createdAt).getTime() / 1000),
    }));
    
    // Include staking positions as activities
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
    
    // Only add sample activities if no real activities exist
    if (activities.length === 0) {
      const sampleActivities: ActivityResponse[] = [
        { id: "post-1", type: "post", user: "ValidatorKing", action: "activities.createdPost", target: "targets.validatorBestPractices", timestamp: now - 300 },
        { id: "vote-1", type: "vote", user: "GovernanceGuru", action: "activities.votedOn", target: "#42", timestamp: now - 600 },
        { id: "badge-1", type: "badge", user: "TBURNMaster", action: "activities.earnedBadge", target: "badgeNames.diamondStaker", timestamp: now - 900 },
        { id: "comment-1", type: "comment", user: "DeFiExpert", action: "activities.commentedOn", target: "targets.stakingStrategies", timestamp: now - 1200 },
        { id: "stake-live-1", type: "stake", user: "CryptoWhale", action: "activities.staked", amount: "50,000 TBURN", timestamp: now - 120 },
      ];
      activities.push(...sampleActivities);
    }
    
    const allActivities = activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
    
    res.json(allActivities);
  } catch (error) {
    console.error("[Community] Error fetching activity:", error);
    res.status(503).json({ error: "Failed to fetch activity" });
  }
});

router.get("/badges", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.query.userId as string) || 0;
    
    const dbBadges = await storage.getAllCommunityBadges();
    let userBadges: any[] = [];
    
    if (userId) {
      userBadges = await storage.getUserBadges(userId);
    }
    
    let badges: UserBadgeResponse[] = [];
    
    if (dbBadges.length > 0) {
      badges = dbBadges.map(badge => {
        const userBadge = userBadges.find(ub => ub.badgeId === badge.id);
        return {
          id: badge.id,
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          rarity: badge.rarity as any,
          earnedAt: userBadge?.earnedAt ? Math.floor(new Date(userBadge.earnedAt).getTime() / 1000) : undefined,
          progress: userBadge?.progress || undefined,
          translationKey: badge.name.toLowerCase().replace(/\s+/g, ''),
        };
      });
    } else {
      badges = getSampleBadges();
    }
    
    res.json(badges);
  } catch (error) {
    console.error("[Community] Error fetching badges:", error);
    res.status(503).json({ error: "Failed to fetch badges" });
  }
});

router.post("/badges/:badgeId/progress", async (req: Request, res: Response) => {
  try {
    const { badgeId } = req.params;
    const { userId, progress, userAddress } = req.body;
    const numericUserId = parseInt(userId) || 0;
    
    if (!numericUserId || progress === undefined) {
      return res.status(400).json({ error: "userId and progress are required" });
    }
    
    const progressValue = Math.min(100, Math.max(0, parseInt(progress) || 0));
    
    const existingUserBadge = await storage.getUserBadge(numericUserId, badgeId);
    
    if (existingUserBadge) {
      const isCompleted = progressValue >= 100;
      await storage.updateUserBadge(existingUserBadge.id, {
        progress: progressValue,
        isCompleted,
        earnedAt: isCompleted ? new Date() : existingUserBadge.earnedAt,
      });
      
      if (isCompleted && !existingUserBadge.isCompleted) {
        const badge = await storage.getCommunityBadgeById(badgeId);
        await logActivity("badge_earned", `User${numericUserId}`, "activities.earnedBadge", badge?.name || badgeId);
        broadcastToAll("community_badge_earned", {
          userId: numericUserId,
          badgeId,
          badgeName: badge?.name,
        });
      }
      
      res.json({
        success: true,
        badgeId,
        progress: progressValue,
        isCompleted: progressValue >= 100,
        earnedAt: progressValue >= 100 ? Math.floor(Date.now() / 1000) : undefined,
      });
    } else {
      const isCompleted = progressValue >= 100;
      await storage.createUserBadge({
        userId: numericUserId,
        userAddress: userAddress || "",
        badgeId,
        progress: progressValue,
        isCompleted,
        earnedAt: isCompleted ? new Date() : null,
      });
      
      if (isCompleted) {
        const badge = await storage.getCommunityBadgeById(badgeId);
        await logActivity("badge_earned", `User${numericUserId}`, "activities.earnedBadge", badge?.name || badgeId);
        broadcastToAll("community_badge_earned", {
          userId: numericUserId,
          badgeId,
          badgeName: badge?.name,
        });
      }
      
      res.json({
        success: true,
        badgeId,
        progress: progressValue,
        isCompleted,
        earnedAt: isCompleted ? Math.floor(Date.now() / 1000) : undefined,
      });
    }
  } catch (error) {
    console.error("[Community] Error updating badge progress:", error);
    res.status(503).json({ error: "Failed to update badge progress" });
  }
});

router.post("/badges/:badgeId/award", async (req: Request, res: Response) => {
  try {
    const { badgeId } = req.params;
    const { userId, userAddress } = req.body;
    const numericUserId = parseInt(userId) || 0;
    
    if (!numericUserId) {
      return res.status(400).json({ error: "userId is required" });
    }
    
    const existingUserBadge = await storage.getUserBadge(numericUserId, badgeId);
    if (existingUserBadge?.isCompleted) {
      return res.json({
        success: true,
        badgeId,
        alreadyAwarded: true,
        earnedAt: existingUserBadge.earnedAt ? Math.floor(new Date(existingUserBadge.earnedAt).getTime() / 1000) : undefined,
      });
    }
    
    const userBadge = await storage.awardBadgeToUser(numericUserId, badgeId);
    
    const badge = await storage.getCommunityBadgeById(badgeId);
    await logActivity("badge_earned", `User${numericUserId}`, "activities.earnedBadge", badge?.name || badgeId);
    
    broadcastToAll("community_badge_earned", {
      userId: numericUserId,
      badgeId,
      badgeName: badge?.name,
    });
    
    res.json({
      success: true,
      badgeId,
      alreadyAwarded: false,
      earnedAt: userBadge.earnedAt ? Math.floor(new Date(userBadge.earnedAt).getTime() / 1000) : undefined,
    });
  } catch (error) {
    console.error("[Community] Error awarding badge:", error);
    res.status(503).json({ error: "Failed to award badge" });
  }
});

router.get("/user/:userId/badges", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId) || 0;
    
    if (!userId) {
      return res.status(400).json({ error: "Valid userId is required" });
    }
    
    const userBadges = await storage.getUserBadges(userId);
    const allBadges = await storage.getAllCommunityBadges();
    const sampleBadges = getSampleBadges();
    
    const badges = (allBadges.length > 0 ? allBadges : sampleBadges.map(b => ({
      id: b.id,
      name: b.name,
      description: b.description,
      icon: b.icon,
      rarity: b.rarity,
    }))).map((badge: any) => {
      const userBadge = userBadges.find(ub => ub.badgeId === badge.id);
      return {
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        rarity: badge.rarity,
        progress: userBadge?.progress || 0,
        isCompleted: userBadge?.isCompleted || false,
        earnedAt: userBadge?.earnedAt ? Math.floor(new Date(userBadge.earnedAt).getTime() / 1000) : undefined,
      };
    });
    
    res.json({
      userId,
      totalBadges: badges.length,
      earnedBadges: badges.filter((b: any) => b.isCompleted).length,
      badges,
    });
  } catch (error) {
    console.error("[Community] Error fetching user badges:", error);
    res.status(503).json({ error: "Failed to fetch user badges" });
  }
});

router.get("/user-posts", async (req: Request, res: Response) => {
  try {
    const authorId = parseInt(req.query.authorId as string) || 0;
    
    if (authorId) {
      const posts = await storage.getCommunityPostsByAuthor(authorId);
      const formattedPosts = posts.map(post => ({
        id: post.id,
        title: post.title,
        author: post.authorUsername,
        category: post.category,
        content: post.content,
        likes: post.likes || 0,
        comments: post.commentCount || 0,
        views: post.views || 0,
        isPinned: post.isPinned,
        isHot: post.isHot,
        createdAt: Math.floor(new Date(post.createdAt).getTime() / 1000),
        tags: post.tags || [],
      }));
      res.json(formattedPosts);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error("[Community] Error fetching user posts:", error);
    res.status(503).json({ error: "Failed to fetch user posts" });
  }
});

router.get("/activity-log", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const activities = await storage.getRecentCommunityActivity(limit);
    
    res.json(activities.map(act => ({
      id: act.id,
      type: act.activityType,
      user: act.username,
      action: act.action,
      target: act.targetTitle,
      amount: act.amount,
      timestamp: Math.floor(new Date(act.createdAt).getTime() / 1000),
    })));
  } catch (error) {
    console.error("[Community] Error fetching activity log:", error);
    res.status(503).json({ error: "Failed to fetch activity log" });
  }
});

router.post("/ambassador-application", async (req: Request, res: Response) => {
  try {
    const { name, email, telegram, twitter, reason } = req.body;
    
    if (!name || !email || !reason) {
      return res.status(400).json({ error: "Missing required fields: name, email, reason" });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    
    const applicationId = `AMB-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const application = {
      id: applicationId,
      name,
      email,
      telegram: telegram || null,
      twitter: twitter || null,
      reason,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    
    console.log(`[Community] Ambassador application received: ${applicationId}`, { name, email });
    
    broadcastToAll('ambassador_application', { 
      id: applicationId,
      name,
      submittedAt: application.submittedAt 
    });
    
    res.status(201).json({ 
      success: true, 
      applicationId,
      message: "Application submitted successfully" 
    });
  } catch (error) {
    console.error("[Community] Error processing ambassador application:", error);
    res.status(503).json({ error: "Failed to submit application" });
  }
});

router.post("/translate", async (req: Request, res: Response) => {
  try {
    const { text, targetLang, sourceLang = "en" } = req.body;
    
    if (!text || !targetLang) {
      return res.status(400).json({ error: "Missing text or targetLang" });
    }
    
    const { translationService } = await import("../services/translation-service");
    const translatedText = await translationService.translate(text, targetLang, sourceLang);
    
    res.json({ 
      translatedText,
      sourceLang,
      targetLang
    });
  } catch (error) {
    console.error("[Community] Translation error:", error);
    res.status(500).json({ error: "Translation failed" });
  }
});

router.post("/translate-batch", async (req: Request, res: Response) => {
  try {
    const { items, targetLang, sourceLang = "en" } = req.body;
    
    if (!items || !Array.isArray(items) || !targetLang) {
      return res.status(400).json({ error: "Missing items array or targetLang" });
    }
    
    const { translationService } = await import("../services/translation-service");
    const translations = await translationService.translateBatch(items, targetLang, sourceLang);
    
    res.json({ 
      translations,
      sourceLang,
      targetLang
    });
  } catch (error) {
    console.error("[Community] Batch translation error:", error);
    res.status(500).json({ error: "Translation failed" });
  }
});

export function registerCommunityRoutes(app: any) {
  app.use("/api/community", router);
  console.log("[Community] Routes registered with database persistence");
}

export default router;
