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
}

interface AnnouncementResponse {
  id: string;
  title: string;
  content: string;
  type: 'update' | 'news' | 'alert' | 'feature';
  createdAt: number;
  isImportant: boolean;
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
    
    const filteredPosts = category === "all" 
      ? samplePosts 
      : samplePosts.filter(p => p.category === category);
    
    res.json(filteredPosts);
  } catch (error) {
    console.error("[Community] Error fetching posts:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

router.get("/events", async (req: Request, res: Response) => {
  try {
    const now = Math.floor(Date.now() / 1000);
    
    const events: EventResponse[] = [
      { id: "1", title: "TBURN v7.0 Launch AMA", description: "Join the core team for a live Q&A session about the mainnet launch and upcoming features", type: "ama", startDate: now + 86400, endDate: now + 90000, participants: 1250, maxParticipants: 2000, rewards: "10,000 TBURN", status: "upcoming", isOnline: true },
      { id: "2", title: "DeFi Workshop: Liquidity Mining", description: "Learn advanced liquidity mining strategies with hands-on exercises and expert guidance", type: "workshop", startDate: now + 172800, endDate: now + 180000, participants: 450, maxParticipants: 500, status: "upcoming", isOnline: true },
      { id: "3", title: "TBURN Hackathon 2025", description: "48-hour hackathon to build innovative dApps on TBURN. Join developers worldwide!", type: "hackathon", startDate: now + 604800, endDate: now + 777600, participants: 89, rewards: "100,000 TBURN", status: "upcoming", isOnline: false, location: "Seoul, Korea" },
      { id: "4", title: "Community Meetup - Tokyo", description: "Network with fellow TBURN enthusiasts in Tokyo. Food and drinks provided!", type: "meetup", startDate: now + 259200, endDate: now + 273600, participants: 78, maxParticipants: 100, status: "upcoming", isOnline: false, location: "Tokyo, Japan" },
      { id: "5", title: "Staking Competition", description: "Compete for the highest staking rewards this month. Top stakers win bonus rewards!", type: "competition", startDate: now - 86400, endDate: now + 1209600, participants: 5670, rewards: "50,000 TBURN", status: "live", isOnline: true },
      { id: "6", title: "NFT Art Contest", description: "Create TBURN-themed NFT artwork and win prizes. Submissions open now!", type: "competition", startDate: now - 172800, endDate: now + 604800, participants: 234, rewards: "25,000 TBURN", status: "live", isOnline: true },
      { id: "7", title: "Validator Training Session", description: "Learn how to become a TBURN validator with this comprehensive training session", type: "workshop", startDate: now + 432000, endDate: now + 439200, participants: 156, maxParticipants: 200, status: "upcoming", isOnline: true },
      { id: "8", title: "Community Airdrop Event", description: "Exclusive airdrop for active community members. Complete tasks to earn rewards!", type: "airdrop", startDate: now + 518400, endDate: now + 604800, participants: 3450, rewards: "200,000 TBURN", status: "upcoming", isOnline: true },
    ];
    
    res.json(events);
  } catch (error) {
    console.error("[Community] Error fetching events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

router.get("/announcements", async (req: Request, res: Response) => {
  try {
    const now = Math.floor(Date.now() / 1000);
    
    const announcements: AnnouncementResponse[] = [
      { id: "1", title: "Mainnet Launch Date Confirmed: December 1st", content: "We're excited to announce that TBURN v7.0 Mainnet will officially launch on December 1st, 2025. All systems are go for the biggest upgrade in our history!", type: "news", createdAt: now - 3600, isImportant: true },
      { id: "2", title: "New Staking Tiers Available", content: "Diamond tier staking is now available with up to 25% APY boost. Check out the new staking dashboard for more details.", type: "feature", createdAt: now - 86400, isImportant: false },
      { id: "3", title: "Security Audit Completed", content: "Our smart contracts have passed comprehensive security audits by CertiK and Trail of Bits. Full reports available on GitHub.", type: "update", createdAt: now - 172800, isImportant: true },
      { id: "4", title: "Bridge Integration: Ethereum & BSC Live", content: "Cross-chain bridge is now live for Ethereum and Binance Smart Chain. Transfer your assets seamlessly!", type: "feature", createdAt: now - 259200, isImportant: false },
      { id: "5", title: "Scheduled Maintenance: Node Upgrade", content: "Brief maintenance window scheduled for December 3rd, 2:00 AM UTC. Expected downtime: 15 minutes.", type: "alert", createdAt: now - 14400, isImportant: true },
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
        action: "staked",
        amount: `${parseFloat(pos.stakedAmount || "0").toLocaleString()} TBURN`,
        timestamp: pos.createdAt ? Math.floor(new Date(pos.createdAt).getTime() / 1000) : now - (index * 300),
      });
    });
    
    const additionalActivities: ActivityResponse[] = [
      { id: "post-1", type: "post", user: "ValidatorKing", action: "created a new post", target: "Best Practices for Validators", timestamp: now - 300 },
      { id: "vote-1", type: "vote", user: "GovernanceGuru", action: "voted on proposal", target: "#42", timestamp: now - 600 },
      { id: "badge-1", type: "badge", user: "TBURNMaster", action: "earned badge", target: "Diamond Staker", timestamp: now - 900 },
      { id: "comment-1", type: "comment", user: "DeFiExpert", action: "commented on", target: "Staking Strategies", timestamp: now - 1200 },
      { id: "proposal-1", type: "proposal", user: "CommunityBuilder", action: "submitted proposal", target: "#45", timestamp: now - 1800 },
      { id: "stake-live-1", type: "stake", user: "CryptoWhale", action: "staked", amount: "50,000 TBURN", timestamp: now - 120 },
      { id: "reward-live-1", type: "reward", user: "StakingPro", action: "claimed rewards", amount: "1,250 TBURN", timestamp: now - 1500 },
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
      { id: "1", name: "Early Adopter", description: "Joined during the genesis period", icon: "star", rarity: "legendary", earnedAt: 1672531200 },
      { id: "2", name: "Diamond Hands", description: "Held TBURN for over 1 year", icon: "diamond", rarity: "epic", earnedAt: 1704067200 },
      { id: "3", name: "Governance Participant", description: "Voted on 10+ proposals", icon: "vote", rarity: "rare", progress: 80 },
      { id: "4", name: "Community Helper", description: "Helped 100+ community members", icon: "users", rarity: "rare", earnedAt: 1709251200 },
      { id: "5", name: "Whale Status", description: "Staked 100,000+ TBURN", icon: "coins", rarity: "epic", progress: 65 },
      { id: "6", name: "Content Creator", description: "Created 50+ forum posts", icon: "book", rarity: "common", progress: 40 },
      { id: "7", name: "Validator", description: "Run an active validator node", icon: "shield", rarity: "legendary", earnedAt: 1714521600 },
      { id: "8", name: "Bridge Pioneer", description: "Used cross-chain bridge 10+ times", icon: "bridge", rarity: "rare", progress: 70 },
      { id: "9", name: "DeFi Master", description: "Participated in all DeFi protocols", icon: "trending", rarity: "epic", progress: 85 },
      { id: "10", name: "Bug Hunter", description: "Reported valid security issues", icon: "bug", rarity: "legendary" },
    ];
    
    res.json(badges);
  } catch (error) {
    console.error("[Community] Error fetching badges:", error);
    res.status(500).json({ error: "Failed to fetch badges" });
  }
});

router.post("/posts", async (req: Request, res: Response) => {
  try {
    const { title, content, category, tags } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }
    
    const newPost: ForumPostResponse = {
      id: `post-${Date.now()}`,
      title,
      content,
      author: "CurrentUser",
      category: category || "general",
      tags: tags || [],
      likes: 0,
      comments: 0,
      views: 1,
      isPinned: false,
      isHot: false,
      createdAt: Math.floor(Date.now() / 1000),
    };
    
    res.status(201).json(newPost);
  } catch (error) {
    console.error("[Community] Error creating post:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
});

router.post("/posts/:postId/like", async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    res.json({ success: true, postId, liked: true });
  } catch (error) {
    console.error("[Community] Error liking post:", error);
    res.status(500).json({ error: "Failed to like post" });
  }
});

router.post("/events/:eventId/join", async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    res.json({ success: true, eventId, joined: true });
  } catch (error) {
    console.error("[Community] Error joining event:", error);
    res.status(500).json({ error: "Failed to join event" });
  }
});

export function registerCommunityRoutes(app: any) {
  app.use("/api/community", router);
  console.log("[Community] Routes registered");
}

export default router;
