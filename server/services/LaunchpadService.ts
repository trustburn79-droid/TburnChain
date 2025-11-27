import { storage } from "../storage";
import type { LaunchpadProject, LaunchRound, LaunchpadActivity } from "@shared/schema";
import { randomUUID } from "crypto";

const PRECISION = BigInt("1000000000000000000");

function generateAddress(): string {
  const chars = '0123456789abcdef';
  let result = '0x';
  for (let i = 0; i < 40; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function generateTxHash(): string {
  const chars = '0123456789abcdef';
  let result = '0x';
  for (let i = 0; i < 64; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

const DEMO_PROJECTS = [
  {
    name: "Celestial Dragons",
    symbol: "CDRAG",
    description: "A legendary collection of 10,000 unique dragon NFTs with AI-generated traits and dynamic evolution mechanics.",
    category: "art",
    totalSupply: "10000",
    mintPrice: (BigInt(100) * PRECISION).toString(),
    maxPerWallet: 5,
    royaltyBps: 750,
    status: "active",
    featured: true,
    verified: true,
    aiScore: 92.5,
  },
  {
    name: "MetaVerse Lands",
    symbol: "MVLAND",
    description: "Premium virtual real estate in the TBURN metaverse. Each land plot offers unique utility and building capabilities.",
    category: "metaverse",
    totalSupply: "5000",
    mintPrice: (BigInt(500) * PRECISION).toString(),
    maxPerWallet: 3,
    royaltyBps: 500,
    status: "pending",
    featured: true,
    verified: true,
    aiScore: 88.0,
  },
  {
    name: "Crypto Punks V2",
    symbol: "CPNK2",
    description: "The next generation of pixel art collectibles with enhanced rarity mechanics and staking rewards.",
    category: "pfp",
    totalSupply: "8888",
    mintPrice: (BigInt(50) * PRECISION).toString(),
    maxPerWallet: 10,
    royaltyBps: 600,
    status: "active",
    featured: false,
    verified: true,
    aiScore: 85.5,
  },
  {
    name: "GameFi Heroes",
    symbol: "GFHERO",
    description: "Play-to-earn gaming characters with unique abilities, stats, and cross-game compatibility.",
    category: "gaming",
    totalSupply: "15000",
    mintPrice: (BigInt(75) * PRECISION).toString(),
    maxPerWallet: 8,
    royaltyBps: 550,
    status: "pending",
    featured: true,
    verified: false,
    aiScore: 79.0,
  },
  {
    name: "Quantum Artifacts",
    symbol: "QART",
    description: "Unique digital artifacts powered by quantum-inspired algorithms. Each piece is mathematically one-of-a-kind.",
    category: "art",
    totalSupply: "3333",
    mintPrice: (BigInt(250) * PRECISION).toString(),
    maxPerWallet: 2,
    royaltyBps: 1000,
    status: "completed",
    featured: false,
    verified: true,
    aiScore: 94.0,
  },
  {
    name: "Sound Waves",
    symbol: "SWAVE",
    description: "Music NFTs with royalty sharing. Own a piece of the next hit song and earn passive income.",
    category: "music",
    totalSupply: "1000",
    mintPrice: (BigInt(150) * PRECISION).toString(),
    maxPerWallet: 5,
    royaltyBps: 1500,
    status: "pending",
    featured: false,
    verified: false,
    aiScore: 72.0,
  },
];

export class LaunchpadService {
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    try {
      const existingProjects = await storage.getAllLaunchpadProjects();
      if (existingProjects.length > 0) {
        console.log(`[Launchpad] Found ${existingProjects.length} existing projects`);
        this.initialized = true;
        return;
      }

      console.log("[Launchpad] Initializing demo launchpad projects...");
      await this.generateDemoData();
      this.initialized = true;
      console.log("[Launchpad] Demo data initialization complete");
    } catch (error) {
      console.error("[Launchpad] Initialization error:", error);
    }
  }

  private async generateDemoData() {
    const now = new Date();

    for (const projectData of DEMO_PROJECTS) {
      const projectId = `lp_${randomUUID().replace(/-/g, '').slice(0, 40)}`;
      const creatorAddress = generateAddress();

      let launchDate: Date;
      let endDate: Date;
      let totalMinted = 0;
      let totalRaised = BigInt(0);
      let uniqueMinters = 0;

      if (projectData.status === "completed") {
        launchDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        endDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        totalMinted = parseInt(projectData.totalSupply);
        totalRaised = BigInt(projectData.mintPrice) * BigInt(totalMinted);
        uniqueMinters = Math.floor(totalMinted * 0.3);
      } else if (projectData.status === "active") {
        launchDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        totalMinted = Math.floor(parseInt(projectData.totalSupply) * (0.3 + Math.random() * 0.4));
        totalRaised = BigInt(projectData.mintPrice) * BigInt(totalMinted);
        uniqueMinters = Math.floor(totalMinted * 0.35);
      } else {
        launchDate = new Date(now.getTime() + (3 + Math.random() * 14) * 24 * 60 * 60 * 1000);
        endDate = new Date(launchDate.getTime() + 14 * 24 * 60 * 60 * 1000);
      }

      await storage.createLaunchpadProject({
        name: projectData.name,
        symbol: projectData.symbol,
        description: projectData.description,
        creatorAddress,
        totalSupply: projectData.totalSupply,
        mintPrice: projectData.mintPrice,
        maxPerWallet: projectData.maxPerWallet,
        royaltyBps: projectData.royaltyBps,
        status: projectData.status,
        featured: projectData.featured,
        verified: projectData.verified,
        aiScore: projectData.aiScore,
        category: projectData.category,
        totalRaised: totalRaised.toString(),
        totalMinted,
        uniqueMinters,
        launchDate,
        endDate,
        contractAddress: generateAddress(),
        tags: [projectData.category, "nft", "launchpad"],
        aiAnalysis: {
          riskScore: Math.floor(Math.random() * 30) + 10,
          communityScore: Math.floor(Math.random() * 40) + 60,
          innovationScore: Math.floor(Math.random() * 30) + 70,
        },
      } as any);

      const roundTypes = ["whitelist", "public"];
      for (let i = 0; i < roundTypes.length; i++) {
        const roundType = roundTypes[i];
        const allocation = Math.floor(parseInt(projectData.totalSupply) / 2);
        
        let roundStatus = "pending";
        let roundStartTime: Date;
        let roundEndTime: Date;

        if (projectData.status === "completed") {
          roundStatus = "completed";
          roundStartTime = new Date(launchDate.getTime() + i * 7 * 24 * 60 * 60 * 1000);
          roundEndTime = new Date(roundStartTime.getTime() + 7 * 24 * 60 * 60 * 1000);
        } else if (projectData.status === "active") {
          if (i === 0) {
            roundStatus = "completed";
            roundStartTime = new Date(launchDate.getTime());
            roundEndTime = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
          } else {
            roundStatus = "active";
            roundStartTime = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
            roundEndTime = endDate;
          }
        } else {
          roundStartTime = new Date(launchDate.getTime() + i * 7 * 24 * 60 * 60 * 1000);
          roundEndTime = new Date(roundStartTime.getTime() + 7 * 24 * 60 * 60 * 1000);
        }

        const roundMinted = roundStatus === "completed" ? allocation : 
                           (roundStatus === "active" ? Math.floor(allocation * (0.3 + Math.random() * 0.4)) : 0);

        await storage.createLaunchRound({
          projectId,
          roundNumber: i + 1,
          name: roundType === "whitelist" ? "Whitelist Round" : "Public Round",
          roundType,
          startTime: roundStartTime,
          endTime: roundEndTime,
          price: projectData.mintPrice,
          allocation,
          maxPerWallet: roundType === "whitelist" ? 2 : projectData.maxPerWallet,
          minPerWallet: 1,
          totalMinted: roundMinted,
          totalRaised: (BigInt(projectData.mintPrice) * BigInt(roundMinted)).toString(),
          uniqueParticipants: Math.floor(roundMinted * 0.4),
          whitelistRequired: roundType === "whitelist",
          status: roundStatus,
        } as any);
      }

      await storage.createLaunchpadActivity({
        projectId,
        eventType: "project_created",
        walletAddress: creatorAddress,
        metadata: { name: projectData.name },
      } as any);

      if (projectData.status !== "pending") {
        for (let j = 0; j < 5; j++) {
          await storage.createLaunchpadActivity({
            projectId,
            eventType: "mint",
            walletAddress: generateAddress(),
            quantity: Math.floor(Math.random() * projectData.maxPerWallet) + 1,
            amount: projectData.mintPrice,
            txHash: generateTxHash(),
          } as any);
        }
      }
    }
  }

  async getOverview() {
    await this.initialize();
    return storage.getLaunchpadOverview();
  }

  async getAllProjects() {
    await this.initialize();
    return storage.getAllLaunchpadProjects();
  }

  async getActiveProjects() {
    await this.initialize();
    return storage.getActiveLaunchpadProjects();
  }

  async getUpcomingProjects() {
    await this.initialize();
    return storage.getUpcomingLaunchpadProjects();
  }

  async getCompletedProjects() {
    await this.initialize();
    return storage.getCompletedLaunchpadProjects();
  }

  async getFeaturedProjects(limit: number = 5) {
    await this.initialize();
    return storage.getFeaturedLaunchpadProjects(limit);
  }

  async getProjectById(id: string) {
    await this.initialize();
    return storage.getLaunchpadProjectById(id);
  }

  async getProjectRounds(projectId: string) {
    return storage.getLaunchRoundsByProject(projectId);
  }

  async getActiveRounds() {
    return storage.getActiveLaunchRounds();
  }

  async getWhitelistStatus(projectId: string, walletAddress: string) {
    const entry = await storage.getWhitelistEntry(projectId, walletAddress);
    return {
      isWhitelisted: !!entry,
      allocation: entry?.allocation || 0,
      used: entry?.used || 0,
      remaining: entry ? entry.allocation - entry.used : 0,
    };
  }

  async getUserAllocations(walletAddress: string) {
    return storage.getAllocationsByWallet(walletAddress);
  }

  async getUserVesting(walletAddress: string) {
    return storage.getVestingSchedulesByWallet(walletAddress);
  }

  async getRecentActivity(limit: number = 50) {
    return storage.getRecentLaunchpadActivity(limit);
  }

  async getProjectActivity(projectId: string, limit: number = 50) {
    return storage.getLaunchpadActivityByProject(projectId, limit);
  }

  async mintNft(projectId: string, walletAddress: string, quantity: number) {
    await this.initialize();
    
    const project = await storage.getLaunchpadProjectById(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    if (project.status !== "active") {
      throw new Error("Project is not active for minting");
    }

    const remaining = parseInt(project.totalSupply) - project.totalMinted;
    if (quantity > remaining) {
      throw new Error(`Only ${remaining} NFTs remaining`);
    }

    if (quantity > project.maxPerWallet) {
      throw new Error(`Maximum ${project.maxPerWallet} per wallet`);
    }

    const totalCost = BigInt(project.mintPrice) * BigInt(quantity);
    const txHash = generateTxHash();

    await storage.updateLaunchpadProject(projectId, {
      totalMinted: project.totalMinted + quantity,
      totalRaised: (BigInt(project.totalRaised || "0") + totalCost).toString(),
      uniqueMinters: project.uniqueMinters + 1,
    });

    const rounds = await storage.getLaunchRoundsByProject(projectId);
    const activeRound = rounds.find(r => r.status === "active") || rounds[0];
    
    await storage.createLaunchAllocation({
      projectId,
      roundId: activeRound?.id || projectId,
      walletAddress,
      quantity,
      pricePerUnit: project.mintPrice,
      totalPaid: totalCost.toString(),
      txHash,
      status: "confirmed",
      mintedAt: new Date(),
    } as any);

    await storage.createLaunchpadActivity({
      projectId,
      eventType: "mint",
      walletAddress,
      quantity,
      amount: totalCost.toString(),
      txHash,
    } as any);

    return {
      success: true,
      txHash,
      quantity,
      totalCost: totalCost.toString(),
      projectName: project.name,
    };
  }

  async joinWhitelist(projectId: string, walletAddress: string) {
    await this.initialize();

    const project = await storage.getLaunchpadProjectById(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const existing = await storage.getWhitelistEntry(projectId, walletAddress);
    if (existing) {
      throw new Error("Already whitelisted for this project");
    }

    const defaultAllocation = Math.min(3, project.maxPerWallet);

    await storage.createWhitelistEntry({
      projectId,
      walletAddress,
      allocation: defaultAllocation,
      used: 0,
      tier: "standard",
      status: "active",
    } as any);

    await storage.createLaunchpadActivity({
      projectId,
      eventType: "whitelist_added",
      walletAddress,
      metadata: { allocation: defaultAllocation },
    } as any);

    return {
      success: true,
      allocation: defaultAllocation,
      projectName: project.name,
    };
  }

  async claimNft(projectId: string, walletAddress: string) {
    await this.initialize();

    const project = await storage.getLaunchpadProjectById(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const allocations = await storage.getAllocationsByWallet(walletAddress);
    const projectAllocation = allocations.find(a => a.projectId === projectId);

    if (!projectAllocation) {
      throw new Error("No allocation found for this project");
    }

    if (projectAllocation.status === "claimed") {
      throw new Error("NFTs already claimed");
    }

    const claimable = projectAllocation.quantity;
    if (claimable <= 0) {
      throw new Error("No NFTs available to claim");
    }

    const txHash = generateTxHash();

    await storage.updateLaunchAllocation(projectAllocation.id, {
      status: "claimed",
    });

    await storage.createLaunchpadActivity({
      projectId,
      eventType: "claim",
      walletAddress,
      quantity: claimable,
      txHash,
    } as any);

    return {
      success: true,
      txHash,
      claimed: claimable,
      projectName: project.name,
    };
  }
}

export const launchpadService = new LaunchpadService();
