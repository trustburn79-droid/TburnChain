import { storage } from "../storage";

const PRECISION = BigInt("1000000000000000000");
const TBURN_PRICE = 0.05;

function generateRandomAddress(): string {
  const chars = "0123456789abcdef";
  let address = "0x";
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
}

function generateRandomHash(): string {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

function toWei(amount: number): string {
  return (BigInt(Math.floor(amount * 1000000)) * (PRECISION / BigInt(1000000))).toString();
}

const GAME_CATEGORIES = ["arcade", "rpg", "strategy", "action", "puzzle", "card", "racing", "sports", "casual"];
const GAME_GENRES = ["Battle Arena", "Trading Card", "Farm Simulator", "Racing", "Puzzle Quest", "Adventure", "Survival", "RPG", "Simulation"];
const ASSET_TYPES = ["character", "weapon", "armor", "item", "land", "vehicle", "pet", "card", "skin"];
const ASSET_RARITIES = ["common", "uncommon", "rare", "epic", "legendary", "mythic"];
const REWARD_TYPES = ["gameplay", "tournament", "staking", "referral", "achievement", "daily", "weekly"];
const TOURNAMENT_TYPES = ["single_elimination", "double_elimination", "round_robin", "swiss", "battle_royale", "league"];
const ACHIEVEMENT_CATEGORIES = ["gameplay", "social", "collection", "tournament", "special", "seasonal"];
const EVENT_TYPES = ["game_started", "game_ended", "reward_earned", "asset_minted", "asset_transferred", "tournament_joined", "tournament_won", "achievement_unlocked", "level_up"];

const DEMO_GAMES = [
  {
    name: "TBURN Arena",
    slug: "tburn-arena",
    description: "Epic blockchain-powered battle arena with Play-to-Earn mechanics. Collect heroes, build teams, and compete in tournaments for TBURN rewards.",
    shortDescription: "Battle arena with P2E mechanics",
    category: "action",
    genre: "Battle Arena",
    developer: "TBURN Games Studio",
    featured: true,
    verified: true,
    tokenSymbol: "ARENA",
    playToEarnEnabled: true,
    stakingEnabled: true,
    tournamentEnabled: true,
  },
  {
    name: "Crypto Cards",
    slug: "crypto-cards",
    description: "Collectible card game where each card is a unique NFT. Trade, battle, and earn rewards with your card collection.",
    shortDescription: "NFT trading card game",
    category: "card",
    genre: "Trading Card",
    developer: "CardMasters Inc",
    featured: true,
    verified: true,
    tokenSymbol: "CARD",
    playToEarnEnabled: true,
    stakingEnabled: false,
    tournamentEnabled: true,
  },
  {
    name: "Metaverse Farm",
    slug: "metaverse-farm",
    description: "Build and manage your virtual farm in the TBURN metaverse. Grow crops, raise animals, and trade produce for tokens.",
    shortDescription: "Virtual farming simulator",
    category: "casual",
    genre: "Farm Simulator",
    developer: "Virtual Farms LLC",
    featured: false,
    verified: true,
    tokenSymbol: "FARM",
    playToEarnEnabled: true,
    stakingEnabled: true,
    tournamentEnabled: false,
  },
  {
    name: "Speed Racers",
    slug: "speed-racers",
    description: "High-octane blockchain racing game. Own unique vehicles as NFTs and race for glory and rewards.",
    shortDescription: "NFT racing game",
    category: "racing",
    genre: "Racing",
    developer: "RaceChain Studios",
    featured: true,
    verified: true,
    tokenSymbol: "SPEED",
    playToEarnEnabled: true,
    stakingEnabled: false,
    tournamentEnabled: true,
  },
  {
    name: "Puzzle Quest DeFi",
    slug: "puzzle-quest-defi",
    description: "Solve puzzles to earn tokens! A unique blend of puzzle mechanics with DeFi rewards integration.",
    shortDescription: "Puzzle game with DeFi rewards",
    category: "puzzle",
    genre: "Puzzle Quest",
    developer: "PuzzleFi Games",
    featured: false,
    verified: true,
    tokenSymbol: "PUZZLE",
    playToEarnEnabled: true,
    stakingEnabled: true,
    tournamentEnabled: false,
  },
  {
    name: "Dragon Quest NFT",
    slug: "dragon-quest-nft",
    description: "Epic RPG adventure where you collect dragons, explore dungeons, and battle for treasures. Each dragon is a unique NFT.",
    shortDescription: "Dragon collection RPG",
    category: "rpg",
    genre: "Adventure",
    developer: "Dragon Studios",
    featured: true,
    verified: true,
    tokenSymbol: "DRAGON",
    playToEarnEnabled: true,
    stakingEnabled: true,
    tournamentEnabled: true,
  },
  {
    name: "Strategy Kingdoms",
    slug: "strategy-kingdoms",
    description: "Build your kingdom, train armies, and conquer territories. Strategic gameplay with blockchain asset ownership.",
    shortDescription: "Blockchain strategy game",
    category: "strategy",
    genre: "Simulation",
    developer: "Kingdom Builders",
    featured: false,
    verified: false,
    tokenSymbol: "KING",
    playToEarnEnabled: true,
    stakingEnabled: false,
    tournamentEnabled: true,
  },
  {
    name: "Sports Champions",
    slug: "sports-champions",
    description: "Collect and trade sports player NFTs. Build your dream team and compete in leagues for big rewards.",
    shortDescription: "Fantasy sports with NFTs",
    category: "sports",
    genre: "Sports Manager",
    developer: "SportsChain",
    featured: false,
    verified: true,
    tokenSymbol: "SPORT",
    playToEarnEnabled: true,
    stakingEnabled: false,
    tournamentEnabled: true,
  },
];

const DEMO_BADGES = [
  { name: "First Victory", description: "Win your first game", category: "gameplay", rarity: "common", points: 10, isGlobal: true },
  { name: "Chain Master", description: "Complete 100 games on TBURN blockchain", category: "gameplay", rarity: "rare", points: 100, isGlobal: true },
  { name: "Tournament Champion", description: "Win a tournament", category: "tournament", rarity: "epic", points: 500, isGlobal: true },
  { name: "NFT Collector", description: "Own 10 game assets", category: "collection", rarity: "uncommon", points: 50, isGlobal: true },
  { name: "Legendary Holder", description: "Own a legendary rarity asset", category: "collection", rarity: "legendary", points: 1000, isGlobal: true },
  { name: "Social Butterfly", description: "Refer 5 friends", category: "social", rarity: "uncommon", points: 30, isGlobal: true },
  { name: "Daily Warrior", description: "Play 30 consecutive days", category: "special", rarity: "epic", points: 250, isGlobal: true },
  { name: "Season Pioneer", description: "Complete a seasonal event", category: "seasonal", rarity: "rare", points: 150, isGlobal: true },
];

export class GameFiService {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    const existingProjects = await storage.getAllGamefiProjects();
    
    if (existingProjects.length === 0) {
      console.log("[GameFi] Generating demo data...");
      await this.generateDemoData();
    } else {
      console.log(`[GameFi] Found ${existingProjects.length} existing projects`);
    }
    
    this.initialized = true;
    console.log("[GameFi] Service initialized successfully");
  }

  private async generateDemoData(): Promise<void> {
    const projectIds: string[] = [];
    
    for (const game of DEMO_GAMES) {
      const totalPlayers = Math.floor(Math.random() * 50000) + 5000;
      const activePlayers24h = Math.floor(totalPlayers * (0.1 + Math.random() * 0.3));
      const totalVolume = toWei(Math.floor(Math.random() * 500000) + 50000);
      const dailyVolume = toWei(Math.floor(Math.random() * 10000) + 1000);
      const totalRewards = toWei(Math.floor(Math.random() * 100000) + 10000);
      
      const project = await storage.createGamefiProject({
        ...game,
        developerAddress: generateRandomAddress(),
        contractAddress: generateRandomAddress(),
        nftContractAddress: generateRandomAddress(),
        totalPlayers,
        activePlayers24h,
        totalVolume,
        dailyVolume,
        totalRewardsDistributed: totalRewards,
        aiScore: 60 + Math.random() * 35,
        socialScore: Math.floor(Math.random() * 10000),
        rating: 3 + Math.random() * 2,
        ratingCount: Math.floor(Math.random() * 5000) + 100,
        status: "active",
      });
      
      projectIds.push(project.id);
      
      const assetCount = Math.floor(Math.random() * 15) + 5;
      for (let i = 0; i < assetCount; i++) {
        const assetType = ASSET_TYPES[Math.floor(Math.random() * ASSET_TYPES.length)];
        const rarity = ASSET_RARITIES[Math.floor(Math.random() * ASSET_RARITIES.length)];
        const rarityMultiplier = ASSET_RARITIES.indexOf(rarity) + 1;
        
        await storage.createGameAsset({
          projectId: project.id,
          tokenId: `${project.slug}-${assetType}-${i + 1}`,
          name: `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} ${assetType.charAt(0).toUpperCase() + assetType.slice(1)} #${i + 1}`,
          description: `A ${rarity} ${assetType} from ${game.name}`,
          assetType,
          rarity,
          ownerAddress: generateRandomAddress(),
          price: toWei(50 * rarityMultiplier + Math.random() * 100 * rarityMultiplier),
          isListed: Math.random() > 0.7,
          isStaked: Math.random() > 0.8,
          stakingRewards: toWei(Math.random() * 10 * rarityMultiplier),
          attributes: { level: Math.floor(Math.random() * 100) + 1, power: Math.floor(Math.random() * 1000) + 100 },
          usageCount: Math.floor(Math.random() * 1000),
          winRate: 0.4 + Math.random() * 0.4,
          earnedRewards: toWei(Math.random() * 50 * rarityMultiplier),
          mintedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        });
      }
      
      const leaderboardPlayers = Math.floor(Math.random() * 20) + 10;
      for (let i = 0; i < leaderboardPlayers; i++) {
        await storage.createOrUpdateLeaderboardEntry({
          projectId: project.id,
          leaderboardType: "global",
          walletAddress: generateRandomAddress(),
          playerName: `Player${Math.floor(Math.random() * 10000)}`,
          rank: i + 1,
          score: ((leaderboardPlayers - i) * 1000 + Math.floor(Math.random() * 500)).toString(),
          wins: Math.floor(Math.random() * 100) + (leaderboardPlayers - i) * 2,
          losses: Math.floor(Math.random() * 50),
          gamesPlayed: Math.floor(Math.random() * 200) + 50,
          winStreak: Math.floor(Math.random() * 10),
          bestWinStreak: Math.floor(Math.random() * 20),
          totalEarned: toWei(Math.random() * 1000 + 100),
        });
      }
    }
    
    for (const badge of DEMO_BADGES) {
      await storage.createAchievementBadge({
        ...badge,
        isGlobal: true,
        isHidden: false,
        rewardAmount: toWei(badge.points / 10),
        rewardTokenSymbol: "TBURN",
        totalUnlocks: Math.floor(Math.random() * 5000) + 100,
      });
    }
    
    for (let t = 0; t < 5; t++) {
      const projectId = projectIds[Math.floor(Math.random() * projectIds.length)];
      const project = await storage.getGamefiProjectById(projectId);
      if (!project) continue;
      
      const tournamentType = TOURNAMENT_TYPES[Math.floor(Math.random() * TOURNAMENT_TYPES.length)];
      const maxParticipants = [16, 32, 64, 128][Math.floor(Math.random() * 4)];
      const currentParticipants = Math.floor(Math.random() * maxParticipants * 0.8);
      const prizePool = toWei(Math.floor(Math.random() * 50000) + 5000);
      
      const now = Date.now();
      const startOffset = (t < 2 ? -1 : 1) * (Math.random() * 7 * 24 * 60 * 60 * 1000);
      const startTime = new Date(now + startOffset);
      const endTime = new Date(startTime.getTime() + 3 * 24 * 60 * 60 * 1000);
      const registrationStart = new Date(startTime.getTime() - 2 * 24 * 60 * 60 * 1000);
      const registrationEnd = new Date(startTime.getTime() - 12 * 60 * 60 * 1000);
      
      const status = startOffset < 0 ? (t === 0 ? "active" : "completed") : "upcoming";
      
      const tournament = await storage.createTournament({
        projectId,
        name: `${project.name} ${["Championship", "Grand Prix", "Open", "Invitational", "League"][t]}`,
        description: `Join the ${project.name} tournament and compete for ${prizePool} TBURN in prizes!`,
        tournamentType,
        status,
        entryFee: toWei(Math.random() * 100 + 10),
        prizePool,
        prizeDistribution: { "1st": "50%", "2nd": "30%", "3rd": "15%", "4th": "5%" },
        maxParticipants,
        currentParticipants,
        minParticipants: 4,
        requiresNft: Math.random() > 0.7,
        registrationStart,
        registrationEnd,
        startTime,
        endTime,
        rules: "Standard tournament rules apply. No cheating or exploits allowed.",
      });
      
      for (let p = 0; p < currentParticipants; p++) {
        await storage.joinTournament({
          tournamentId: tournament.id,
          walletAddress: generateRandomAddress(),
          playerName: `Competitor${Math.floor(Math.random() * 10000)}`,
          status: status === "completed" ? (p < 4 ? "winner" : "eliminated") : "registered",
          seed: p + 1,
          wins: status === "completed" ? Math.floor(Math.random() * 5) : 0,
          losses: status === "completed" ? Math.floor(Math.random() * 3) : 0,
          score: status === "completed" ? (Math.random() * 10000).toString() : "0",
          placement: status === "completed" ? p + 1 : null,
          entryPaid: true,
        });
      }
    }
    
    for (let i = 0; i < 50; i++) {
      const projectId = projectIds[Math.floor(Math.random() * projectIds.length)];
      const eventType = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
      
      await storage.createGamefiActivity({
        projectId,
        walletAddress: generateRandomAddress(),
        eventType,
        amount: eventType.includes("reward") || eventType.includes("earned") ? toWei(Math.random() * 100) : null,
        txHash: Math.random() > 0.3 ? generateRandomHash() : null,
        metadata: { timestamp: Date.now() - Math.random() * 24 * 60 * 60 * 1000 },
      });
    }
    
    console.log("[GameFi] Demo data generated successfully");
  }
  
  async getOverview() {
    return await storage.getGamefiOverview();
  }
  
  async getAllProjects() {
    return await storage.getAllGamefiProjects();
  }
  
  async getActiveProjects() {
    return await storage.getActiveGamefiProjects();
  }
  
  async getFeaturedProjects(limit: number = 5) {
    return await storage.getFeaturedGamefiProjects(limit);
  }
  
  async getProjectById(id: string) {
    return await storage.getGamefiProjectById(id);
  }
  
  async getProjectBySlug(slug: string) {
    return await storage.getGamefiProjectBySlug(slug);
  }
  
  async getProjectAssets(projectId: string) {
    return await storage.getGameAssetsByProject(projectId);
  }
  
  async getPlayerAssets(walletAddress: string) {
    return await storage.getGameAssetsByOwner(walletAddress);
  }
  
  async getProjectLeaderboard(projectId: string, type: string = "global", limit: number = 100) {
    return await storage.getGameLeaderboard(projectId, type, limit);
  }
  
  async getAllTournaments() {
    return await storage.getAllTournaments();
  }
  
  async getActiveTournaments() {
    return await storage.getActiveTournaments();
  }
  
  async getUpcomingTournaments() {
    return await storage.getUpcomingTournaments();
  }
  
  async getTournamentById(id: string) {
    return await storage.getTournamentById(id);
  }
  
  async getTournamentParticipants(tournamentId: string) {
    return await storage.getTournamentParticipants(tournamentId);
  }
  
  async getAllBadges(projectId?: string) {
    return await storage.getAllAchievementBadges(projectId);
  }
  
  async getGlobalBadges() {
    return await storage.getGlobalAchievementBadges();
  }
  
  async getPlayerAchievements(walletAddress: string) {
    return await storage.getPlayerAchievements(walletAddress);
  }
  
  async getPlayerRewards(walletAddress: string) {
    return await storage.getGameRewardsByWallet(walletAddress);
  }
  
  async getPendingRewards(walletAddress: string) {
    return await storage.getPendingGameRewards(walletAddress);
  }
  
  async getRecentActivity(limit: number = 50) {
    return await storage.getRecentGamefiActivity(limit);
  }
  
  async getProjectActivity(projectId: string, limit: number = 50) {
    return await storage.getGamefiActivityByProject(projectId, limit);
  }
  
  async joinTournament(tournamentId: string, walletAddress: string, playerName?: string) {
    const tournament = await storage.getTournamentById(tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }
    
    if (tournament.status !== "upcoming" && tournament.status !== "registration") {
      throw new Error("Tournament registration is closed");
    }
    
    if (tournament.currentParticipants >= tournament.maxParticipants) {
      throw new Error("Tournament is full");
    }
    
    const participants = await storage.getTournamentParticipants(tournamentId);
    const alreadyJoined = participants.find((p: any) => p.walletAddress === walletAddress);
    if (alreadyJoined) {
      throw new Error("Already registered for this tournament");
    }
    
    const participant = await storage.joinTournament({
      tournamentId,
      walletAddress,
      playerName: playerName || `Player${Math.floor(Math.random() * 10000)}`,
      status: "registered",
      seed: tournament.currentParticipants + 1,
      wins: 0,
      losses: 0,
      score: "0",
      entryPaid: true,
    });
    
    await storage.updateTournament(tournamentId, {
      currentParticipants: tournament.currentParticipants + 1,
    });
    
    await storage.createGamefiActivity({
      projectId: tournament.projectId,
      walletAddress,
      eventType: "tournament_joined",
      amount: tournament.entryFee || null,
      txHash: generateRandomHash(),
      metadata: { tournamentId, tournamentName: tournament.name },
    });
    
    return participant;
  }
  
  async claimRewards(walletAddress: string) {
    const pendingRewards = await storage.getPendingGameRewards(walletAddress);
    
    if (!pendingRewards || pendingRewards.length === 0) {
      throw new Error("No pending rewards to claim");
    }
    
    let totalAmount = BigInt(0);
    const claimedRewards = [];
    const txHash = generateRandomHash();
    
    for (const reward of pendingRewards) {
      await storage.claimGameReward(reward.id, txHash);
      totalAmount += BigInt(reward.amount || 0);
      claimedRewards.push(reward.id);
      
      await storage.createGamefiActivity({
        projectId: reward.projectId,
        walletAddress,
        eventType: "reward_earned",
        amount: reward.amount,
        txHash,
        metadata: { rewardType: reward.rewardType, rewardId: reward.id },
      });
    }
    
    return {
      claimedCount: claimedRewards.length,
      totalAmount: totalAmount.toString(),
      txHash,
      claimedRewardIds: claimedRewards,
    };
  }
  
  async equipAsset(assetId: string, walletAddress: string) {
    const asset = await storage.getGameAssetById(assetId);
    
    if (!asset) {
      throw new Error("Asset not found");
    }
    
    if (asset.ownerAddress !== walletAddress) {
      throw new Error("You don't own this asset");
    }
    
    const currentAttributes = asset.attributes || {};
    const isCurrentlyEquipped = currentAttributes.equipped === true;
    const newEquipStatus = !isCurrentlyEquipped;
    
    const updatedAsset = await storage.updateGameAsset(assetId, {
      attributes: { ...currentAttributes, equipped: newEquipStatus },
    });
    
    await storage.createGamefiActivity({
      projectId: asset.projectId,
      walletAddress,
      eventType: newEquipStatus ? "asset_equipped" : "asset_unequipped",
      amount: null,
      txHash: generateRandomHash(),
      metadata: { assetId, assetName: asset.name, assetType: asset.assetType },
    });
    
    return { ...updatedAsset, isEquipped: newEquipStatus };
  }
  
  async getAssetById(assetId: string) {
    return await storage.getGameAssetById(assetId);
  }
}

export const gameFiService = new GameFiService();
